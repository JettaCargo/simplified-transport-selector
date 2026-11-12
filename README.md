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
PORT=8085 npm start
# POST http://127.0.0.1:8085/transports_selection
# GET  http://127.0.0.1:8085/   (liveness)
```

### Gateway contract

| Direction | Requirement |
|---|---|
| Request | `collects`, `vehicles`, `config.minimum_required_*`, `gapVolume`, criteria, `log_header` |
| Optional | `reselection_feedback.failed_co_loads[{ vehicle_id, collect_ids, reason }]` |
| Success | `{ vehicles_array: [{ vehicle: { id }, collects: [{ id }] }] }` and **no** `apiError` |
| Failure | `{ msg, apiError }` (gateway throws on `apiError`) |
| IDs | every `vehicle.id` and `collect.id` must exist in the request |
| Connection | responses send `Connection: close` |

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
- `mocha` / `chai` — tests (dev)

## Tests

```bash
npm test
```

## Deploy (GitHub Actions + EKS)

Mirrors the old Java selector layout: ECR image + ClusterIP Service on port `8085`.

| Branch | Deploy env | Image tags | K8s suffix | Service DNS |
|---|---|---|---|---|
| `dev` | `dev` | `dev-<sha7>` (+ floating `dev`) | `dev` | `simplified-transport-selector-dev:8085` |
| `stage` | `stage` | `stage-<sha7>` (+ floating `stage`) | `stage` | `simplified-transport-selector-stage:8085` |
| `main` | `main` → prod | `prod-<sha7>` (+ floating `prod`) | `prod` | `simplified-transport-selector-prod:8085` |

K8s deploy applies the **unique** `env-<sha7>` tag (`imagePullPolicy: IfNotPresent`). Each commit changes the image reference so pods roll without Always-pull.

ECR lifecycle (`k8s/ecr-lifecycle-policy.json`, applied by `scripts/ci_ensure_ecr_repository.sh`): keep **only the newest** tagged image per prefix `dev-` / `stage-` / `prod-`; expire untagged after 1 day.

Pipeline: `.github/workflows/ci.yml` (test → build → ECR → `kubectl apply` + `rollout status` on `eks-prod`).

One-time AWS setup (same pattern as `route-allocation-cache`):

1. Create ECR repo `simplified-transport-selector` (or let CI create it; CI also applies the lifecycle policy).
2. Create IAM role `github-actions-simplified-transport-selector-deploy` with OIDC to this repo and policies under `iam/`.
3. Apply `iam/github-actions-deploy-k8s-rbac.yaml` on the cluster.
4. Create GitHub Environments `dev`, `stage`, `main` with required reviewers if desired.
5. Point GW dual-selector env vars + `transport_selector_backend` when ready to cut over.

Local image smoke:

```bash
docker build -f container/Dockerfile -t simplified-transport-selector:local .
docker run --rm -p 8085:8085 simplified-transport-selector:local
```
