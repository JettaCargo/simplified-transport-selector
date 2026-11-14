#!/usr/bin/env bash
set -euo pipefail
: "${ENV:?ENV is required}"
: "${IMAGE_TAG:?IMAGE_TAG is required}"
: "${PROJECT_NAME:?PROJECT_NAME is required}"
repository_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
staging_dir="$(mktemp -d)"
trap 'rm -rf "${staging_dir}"' EXIT
export DEPLOY_ENV="${ENV}"
app_env="$("${repository_root}/scripts/ci_k8s_resolve_app_env.sh")"
if [ "${app_env}" = "prod" ]; then
  NODEPOOL="disruption-sensitive-prod"
  CAPACITY_LINE="karpenter.sh/capacity-type: on-demand"
else
  NODEPOOL="disruption-tolerant-${app_env}"
  CAPACITY_LINE=""
fi
cp "${repository_root}/k8s/template/"* "${staging_dir}/"
for FILE in "${staging_dir}"/*; do
  sed -i "s/VAR_NAME/${PROJECT_NAME}/g" "${FILE}"
  sed -i "s/VAR_ENV/${app_env}/g" "${FILE}"
  sed -i "s/VAR_VERSION/${IMAGE_TAG}/g" "${FILE}"
  sed -i "s/VAR_NODEPOOL/${NODEPOOL}/g" "${FILE}"
  sed -i "s|VAR_CAPACITY_LINE|${CAPACITY_LINE}|g" "${FILE}"
done
kubectl apply -f "${staging_dir}/"
kubectl rollout status "deployment/${PROJECT_NAME}-${app_env}" --timeout=300s
echo "Applied ${PROJECT_NAME}-${app_env} with image tag ${IMAGE_TAG}"
