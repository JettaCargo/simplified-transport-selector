# simplified-transport-selector

Type-level transport selector in Node.js. Drop-in replacement for the Java
`transport-selector` HTTP surface used by `allocation-gateway`.

It replaces the Java selector’s per-vehicle-copy MILP with:

1. an aggregated MILP (group → vehicle type + type counts) solved by HiGHS
2. first-fit packing of groups into the chosen counts
3. the existing single-type limited fleet scaler (`min(3N, stock)`)
4. optional **reselection bind feedback** cuts (`reselection_feedback.failed_co_loads`)

Unlimited fleets never explode into clones inside the model: a type is one
integer variable `n_t`.

## Requirements

- Node.js 20+

## How to install

```bash
npm install
```

## Usage

Library:

```js
const { select_transports } = require('./src')
const response = await select_transports(payload)
```

HTTP (same surface the allocation-gateway calls):

```bash
PORT=8085 npm start          # runs build/server/http/server.js
# POST http://127.0.0.1:8085/transports_selection
# GET  http://127.0.0.1:8085/livez    liveness: 200 while the event loop answers
# GET  http://127.0.0.1:8085/readyz   readiness: 503 while shutting down or while the solver pool is full
# GET  http://127.0.0.1:8085/         legacy health check, same as /livez
```

### Request isolation

Each HiGHS solve runs on a `worker_threads` worker from a fixed pool
(`SOLVER_POOL_SIZE`, default 2) with its own heap limit. One request cannot
stall another:

- the main thread only parses, builds the model, packs, and answers probes;
- a solve past its time limit plus `SOLVER_HARD_TIMEOUT_GRACE_MILLISECONDS` has its worker killed and replaced;
- a worker crash fails only its own request (`transport_selector.104009`);
- a client that disconnects cancels its queued or running solve;
- when every worker is busy and the queue (`SOLVER_QUEUE_LIMIT`) is full, the request gets `transport_selector.104006` immediately.

On `SIGTERM` the pod marks itself not ready, stops accepting connections,
waits up to `SHUTDOWN_GRACE_MILLISECONDS` for in-flight solves, then stops the
pool and the heartbeat.

### Gateway contract

| Direction | Requirement |
|---|---|
| Request | `collects`, `vehicles`, `config.minimum_required_*`, `gapVolume`, criteria, `log_header` |
| Optional | `reselection_feedback.failed_co_loads[{ vehicle_id, collect_ids, reason }]` |
| Success | `{ vehicles_array: [{ vehicle: { id }, collects: [{ id }] }] }` and **no** `apiError` |
| Failure | HTTP 200 with `{ msg, apiError, messages: { errors: [[key, ...params]], warnings: [], infos: [] } }` (gateway throws on `apiError`) |
| IDs | every `vehicle.id` and `collect.id` must exist in the request |
| Connection | responses send `Connection: close` |

`msg` and `apiError` carry the catalog key; params stay on the tuple. Raw
error text never goes on the wire (unknown failures become `104007` and are
logged with their stack). Keys live in `jettacargo_messages` under service id
`10` (`transport_selector`):

| Key | Meaning |
|---|---|
| `transport_selector.101001` | invalid field (`[path]`) |
| `transport_selector.101002` | vehicle without containers or dimensions (`[vehicle_id]`) |
| `transport_selector.101003` | body larger than `MAX_BODY_BYTES` (`[limit]`) |
| `transport_selector.101004` | model too large (`[dimension, size, limit]`) |
| `transport_selector.104001` | items don't fit any transport (`[detail]`) |
| `transport_selector.104002` | unusable solver status (`[status]`) |
| `transport_selector.104003` | first-fit could not pack the chosen fleet after the retries |
| `transport_selector.104004` | no vehicle for a group (`[group]`) |
| `transport_selector.104005` | body is not JSON |
| `transport_selector.104006` | solver pool busy |
| `transport_selector.104007` | internal error |
| `transport_selector.104008` | time limit reached without a feasible solution |
| `transport_selector.104009` | solver worker crashed |
| `transport_selector.104010` | request aborted by the client |

When first-fit cannot pack the fleet the MILP chose, that assignment is
forbidden with a no-good cut and the model is re-solved, up to
`PACKING_RETRY_LIMIT` extra rounds within one solver time budget.

Every request writes one JSON log line (`event: transport_selection`) with
`log_header`, `selection_phase`, `selection_path`, `queue_wait_milliseconds`,
`solve_milliseconds`, `solver_status`, `assignment_columns`,
`packing_retries`, `outcome_key`, and `total_milliseconds`. Payload contents
are never logged.

### Configuration

| Env var | Default | Purpose |
|---|---|---|
| `PORT` / `HOST` | `8085` / `0.0.0.0` | listener |
| `SOLVER_POOL_SIZE` | `2` | solver workers per pod |
| `SOLVER_QUEUE_LIMIT` | `4` | jobs waiting for a worker before `104006` |
| `SOLVER_TIME_LIMIT_SECONDS` | `60` | HiGHS time budget per request (shared by packing retries) |
| `SOLVER_HARD_TIMEOUT_GRACE_MILLISECONDS` | `5000` | extra time before an overdue worker is killed |
| `SOLVER_WORKER_MAX_OLD_GENERATION_MB` | `256` | heap limit per worker |
| `MAX_BODY_BYTES` | `33554432` | request body limit |
| `SERVER_REQUEST_TIMEOUT_MILLISECONDS` | `120000` | Node `server.requestTimeout` |
| `SERVER_HEADERS_TIMEOUT_MILLISECONDS` | `60000` | Node `server.headersTimeout` |
| `MAX_ASSIGNMENT_COLUMNS` | `50000` | groups × vehicle types allowed in the model |
| `MAX_MODEL_ROWS` | `200000` | constraints allowed in the model |
| `PACKING_RETRY_LIMIT` | `3` | re-solves after a packing failure |
| `SHUTDOWN_GRACE_MILLISECONDS` | `65000` | SIGTERM wait for in-flight solves |
| `ENV` | — | `dev` / `stage` enable the scaler heartbeat |

### Flags to test (gateway + this service)

Gateway env keeps **both** backends configured:

```bash
export TRANSPORT_SELECTOR_HOST="transport-selector-prod"                 # classic Java
export TRANSPORT_SELECTOR_PORT="8085"
export SIMPLIFIED_TRANSPORT_SELECTOR_HOST="simplified-transport-selector-prod"  # this app (local: 127.0.0.1)
export SIMPLIFIED_TRANSPORT_SELECTOR_PORT="8085"                         # local often 18085
```

Cargo / request config chooses which one and whether to send bind feedback:

```json
{
  "config": {
    "algoritmo": {
      "transport_selector_backend": "simplified",
      "enable_reselection_bind_feedback": true
    }
  }
}
```

- `transport_selector_backend`: `classic` | `simplified` (default `classic`)
- `enable_reselection_bind_feedback`: when `true`, gateway auto-sends compiled
  `reselection_feedback` on every reselection (no separate send flag). Only the
  simplified selector applies those cuts.

## Dependencies

- `highs` — WASM MILP solver
- `zod` — input and env validation
- `@jetta/logger`, `@jetta/http`, `@jetta/number-compare` — shared Jetta libs
- `mocha` / `chai` / `c8` — tests and coverage (dev)

## Tests

```bash
npm test
```

## Deploy (GitHub Actions + EKS)

Mirrors the old Java selector layout: ECR image + ClusterIP Service on port `8085`.

| Branch | Deploy env | K8s suffix | Service DNS |
|---|---|---|---|
| `dev` | `dev` | `dev` | `simplified-transport-selector-dev:8085` |
| `stage` | `stage` | `stage` | `simplified-transport-selector-stage:8085` |
| `main` | `main` | `prod` | `simplified-transport-selector-prod:8085` |

Image tags: `${env}-${short_sha}` plus floating `${env}`. The Deployment pins
the immutable `${env}-${short_sha}` tag, so a rollback is a redeploy of an
older commit.

Pipeline: `.github/workflows/ci.yml` (test → build → ECR → `kubectl apply` +
`kubectl rollout status` on `eks-prod`). Resources are applied in place, never
deleted first.

Availability settings in `k8s/template/`:

- rolling update with `maxUnavailable: 0`, liveness on `/livez`, readiness on `/readyz`;
- `preStop` sleep of 10 s and `terminationGracePeriodSeconds: 90` (covers `SHUTDOWN_GRACE_MILLISECONDS`);
- HPA `minReplicas: 2` and a PodDisruptionBudget with `minAvailable: 1`;
- memory sized for two solver workers (request `768Mi`, limit `1Gi`).

One-time AWS setup (same pattern as `route-allocation-cache`):

1. Create ECR repo `simplified-transport-selector` (or let CI create it).
2. Create IAM role `github-actions-simplified-transport-selector-deploy` with OIDC to this repo and policies under `iam/`.
3. Apply `iam/github-actions-deploy-k8s-rbac.yaml` on the cluster.
4. Create GitHub Environments `dev`, `stage`, `main` with required reviewers if desired.
5. Point GW dual-selector env vars + `transport_selector_backend` when ready to cut over.

Local image smoke:

```bash
docker build -f container/Dockerfile -t simplified-transport-selector:local .
docker run --rm -p 8085:8085 simplified-transport-selector:local
```
