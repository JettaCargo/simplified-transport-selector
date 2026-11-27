# simplified-transport-selector

Type-level transport selector in Node.js. Drop-in replacement for the Java
`transport-selector` HTTP surface used by `allocation-gateway`.

It replaces the Java selector's per-vehicle-copy MILP with:

1. an aggregated MILP (group to vehicle type, plus type counts) solved by HiGHS
2. first-fit packing of groups into the chosen counts
3. the single-type limited fleet scaler (`min(3N, stock)`)
4. optional reselection bind-feedback cuts (`reselection_feedback.failed_co_loads`)

Unlimited fleets stay one integer variable `n_t` per type. They are not cloned
inside the model.

Each HiGHS solve runs on a worker from a pool of 2. One request cannot block
the health probes or another request.

## Requirements

- Node.js 20 or newer for local install, build, and tests (`engines` in `package.json`)
- The container image is Node.js 24.3.0 (`container/Dockerfile`)

## How to install

```bash
npm install
npm run build
```

`npm start` does not compile. It runs `build/server/http/server.js`, so the
build step has to come first. `npm test` compiles as part of the test run.

## Usage

Library, after `npm run build`. The package entry is `build/index.js`:

```js
const { select_transports } = require('./build')
const response = await select_transports(payload)
```

HTTP, the surface `allocation-gateway` calls:

```bash
PORT=8085 npm start
# POST http://127.0.0.1:8085/
# POST http://127.0.0.1:8085/transports_selection
# GET  http://127.0.0.1:8085/livez   200 while the process answers
# GET  http://127.0.0.1:8085/        same as /livez
# GET  http://127.0.0.1:8085/readyz  503 while the solver pool is full or shutdown has started
```

A solve that passes its time limit plus `SOLVER_HARD_TIMEOUT_GRACE_MILLISECONDS`
has its worker killed and replaced. A worker crash fails only that request
(`transport_selector.104009`). A client that disconnects cancels its queued or
running solve (`transport_selector.104010`). When every worker is busy and the
queue is full, the request gets `transport_selector.104006` immediately.

On `SIGTERM` the process marks itself not ready, stops accepting connections,
waits up to `SHUTDOWN_GRACE_MILLISECONDS` for in-flight solves, then stops the
pool and the heartbeat.

### Gateway contract

| Direction | Requirement |
|---|---|
| Request | `collects`, `vehicles`, `config.minimum_required_*`, `gapVolume`, criteria, `log_header` |
| Optional | `reselection_feedback.failed_co_loads[{ vehicle_id, collect_ids, reason }]` |
| Success | `{ vehicles_array: [{ vehicle: { id }, collects: [{ id }] }] }` and no `apiError` |
| Failure | HTTP 200 with `{ msg, apiError, messages: { errors: [[key, ...params]], warnings: [], infos: [] } }` (the gateway throws on `apiError`) |
| IDs | every `vehicle.id` and `collect.id` in the response exists in the request |
| Connection | responses send `Connection: close` |

`msg` and `apiError` carry the catalog key. Parameters stay on the tuple. Raw
error text never goes on the wire. An unknown failure becomes `104007` and is
logged with its stack.

Gateway env keeps both backends configured:

```bash
export TRANSPORT_SELECTOR_HOST="transport-selector-prod"                        # classic Java
export TRANSPORT_SELECTOR_PORT="8085"
export SIMPLIFIED_TRANSPORT_SELECTOR_HOST="simplified-transport-selector-prod"  # this app (local: 127.0.0.1)
export SIMPLIFIED_TRANSPORT_SELECTOR_PORT="8085"                                # local often 18085
```

Cargo config chooses the backend and whether to send bind feedback:

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

- `transport_selector_backend`: `classic` or `simplified` (default `classic`)
- `enable_reselection_bind_feedback`: when `true`, the gateway sends compiled `reselection_feedback` on every reselection. Only this selector applies those cuts.

### Error keys

Keys live in `jettacargo_messages` under service id `10` (`transport_selector`):

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
forbidden with a no-good cut and the model is solved again, up to
`PACKING_RETRY_LIMIT` extra rounds. Those rounds share one
`SOLVER_TIME_LIMIT_SECONDS` budget.

### Request log

Every request writes one JSON line, `event: transport_selection`, with
`log_header`, `selection_phase`, `selection_path`, `queue_wait_milliseconds`,
`solve_milliseconds`, `solver_status`, `assignment_columns`, `packing_retries`,
`outcome_key`, and `total_milliseconds`. Payload contents are not logged.
Internal errors and worker crashes add a second line with the stack or crash
detail.

## Configuration

| Env var | Default | Purpose |
|---|---|---|
| `PORT` / `HOST` | `8085` / `0.0.0.0` | listener |
| `SOLVER_POOL_SIZE` | `2` | solver workers per process |
| `SOLVER_QUEUE_LIMIT` | `4` | jobs waiting for a worker before `104006` |
| `SOLVER_TIME_LIMIT_SECONDS` | `60` | HiGHS time budget per request, shared by packing retries |
| `SOLVER_HARD_TIMEOUT_GRACE_MILLISECONDS` | `5000` | extra time before an overdue worker is killed |
| `SOLVER_WORKER_MAX_OLD_GENERATION_MB` | `256` | V8 old-generation cap per worker (the HiGHS WebAssembly heap is outside this cap) |
| `MAX_BODY_BYTES` | `33554432` | request body limit |
| `SERVER_REQUEST_TIMEOUT_MILLISECONDS` | `120000` | Node `server.requestTimeout` |
| `SERVER_HEADERS_TIMEOUT_MILLISECONDS` | `60000` | Node `server.headersTimeout` |
| `MAX_ASSIGNMENT_COLUMNS` | `50000` | groups times vehicle types allowed in the model |
| `MAX_MODEL_ROWS` | `200000` | constraints allowed in the model |
| `PACKING_RETRY_LIMIT` | `3` | extra solves after a packing failure |
| `SHUTDOWN_GRACE_MILLISECONDS` | `65000` | SIGTERM wait for in-flight solves |
| `ENV` | unset | `dev` turns the scaler heartbeat on |
| `SYSTEM_SCALER_URL` | `http://system-scaler:8000` | heartbeat target when `ENV` is `dev` |

## Dependencies

Runtime:

- `highs` — WebAssembly MILP solver
- `zod` — input and environment validation
- `@jetta/logger`, `@jetta/http`, `@jetta/number-compare` — shared Jetta libraries

Development:

- `typescript`, `eslint` — compile and lint
- `mocha`, `chai` — tests
- `c8` — coverage

## Tests

```bash
npm test            # tsc, then Mocha under test/src
npm run lint        # eslint on src and test/src
npm run ci:coverage # same tests, failing under 80% lines, functions, branches, or statements
```

## Deploy

GitHub Actions builds the image, pushes it to ECR, and applies the manifests
on EKS (`eks-prod`). The layout matches the old Java selector: a ClusterIP
Service on port `8085`.

| Branch | Deploy env | K8s suffix | Service DNS |
|---|---|---|---|
| `dev` | `dev` | `dev` | `simplified-transport-selector-dev:8085` |
| `stage` | `stage` | `stage` | `simplified-transport-selector-stage:8085` |
| `main` | `main` | `prod` | `simplified-transport-selector-prod:8085` |

CI pushes two tags: `${env}-${short_sha}` and the floating `${env}`. The
Deployment pins `${env}-${short_sha}`. A rollback is a redeploy of an older
commit. The floating tag is not what the pod runs.

The pipeline is `.github/workflows/ci.yml`: test, build, ECR, then
`kubectl apply` and `kubectl rollout status`. Resources are applied in place.
Nothing is deleted first. A push of `ISSUE-*` does not deploy. Deploys run on
pushes to `dev`, `stage`, and `main`.

Availability settings in `k8s/template/`:

- rolling update with `maxUnavailable: 0`
- liveness on `/livez`, readiness on `/readyz`
- `preStop` sleep of 10 seconds and `terminationGracePeriodSeconds: 90`, which covers `SHUTDOWN_GRACE_MILLISECONDS`
- HorizontalPodAutoscaler `minReplicas: 2`, `maxReplicas: 5`, target 70% CPU
- requests `512Mi` memory and `100m` CPU; limits `512Mi` memory and `500m` CPU

One-time AWS setup (same pattern as `route-allocation-cache`):

1. Create ECR repo `simplified-transport-selector` (or let CI create it).
2. Create IAM role `github-actions-simplified-transport-selector-deploy` with OIDC to this repo and the policies under `iam/`.
3. Apply `iam/github-actions-deploy-k8s-rbac.yaml` on the cluster.
4. Create GitHub Environments `dev`, `stage`, and `main`, with required reviewers if wanted.
5. Point the gateway dual-selector env vars and `transport_selector_backend` when cutting over.

Local image smoke:

```bash
docker build -f container/Dockerfile -t simplified-transport-selector:local .
docker run --rm -p 8085:8085 simplified-transport-selector:local
```
