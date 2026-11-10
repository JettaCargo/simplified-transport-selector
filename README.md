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

Point the gateway at this service:

```bash
export TRANSPORT_SELECTOR_HOST="simplified-transport-selector-prod"  # or 127.0.0.1 locally
export TRANSPORT_SELECTOR_PORT="8085"
```

Enable cumulative reselection bind feedback in the cargo profile / request:

```json
{
  "config": {
    "algoritmo": {
      "enable_reselection_bind_feedback": true
    }
  }
}
```

When the flag is `true`, the gateway automatically builds and sends
`reselection_feedback` on every reselection POST (compiled across passes).
No separate “send feedback” flag.

## Dependencies

- `highs` — WASM MILP solver
- `mocha` / `chai` — tests (dev)

## Tests

```bash
npm test
```

## Deploy (GitHub Actions + EKS)

Mirrors the old Java selector layout: ECR image + ClusterIP Service on port `8085`.

| Branch | Deploy env | K8s suffix | Service DNS |
|---|---|---|---|
| `dev` | dev | `dev` | `simplified-transport-selector-dev:8085` |
| `stage` | stage | `stage` | `simplified-transport-selector-stage:8085` |
| `latest` / `main` | prod | `prod` | `simplified-transport-selector-prod:8085` |

Pipeline: `.github/workflows/ci.yml` (test → build → ECR → `kubectl apply` on `eks-prod`).

One-time AWS setup (same pattern as `route-allocation-cache`):

1. Create ECR repo `simplified-transport-selector` (or let CI create it).
2. Create IAM role `github-actions-simplified-transport-selector-deploy` with OIDC to this repo and policies under `iam/`.
3. Apply `iam/github-actions-deploy-k8s-rbac.yaml` on the cluster.
4. Create GitHub Environments `dev`, `stage`, `latest` with required reviewers if desired.
5. Point GW `TRANSPORT_SELECTOR_HOST` / `PORT` at the new service when ready to cut over.

Local image smoke:

```bash
docker build -f container/Dockerfile -t simplified-transport-selector:local .
docker run --rm -p 8085:8085 simplified-transport-selector:local
```
