#!/usr/bin/env bash
set -euo pipefail
: "${AWS_DEFAULT_REGION:?}"
: "${ECR_REPOSITORY:?}"
repository_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
lifecycle_policy="${repository_root}/k8s/ecr-lifecycle-policy.json"
if ! aws ecr describe-repositories --repository-names "${ECR_REPOSITORY}" --region "${AWS_DEFAULT_REGION}" >/dev/null 2>&1; then
  aws ecr create-repository \
    --repository-name "${ECR_REPOSITORY}" \
    --region "${AWS_DEFAULT_REGION}" \
    --image-scanning-configuration scanOnPush=true
  echo "Created ECR repository ${ECR_REPOSITORY}"
else
  echo "ECR repository ${ECR_REPOSITORY} already exists"
fi
aws ecr put-lifecycle-policy \
  --repository-name "${ECR_REPOSITORY}" \
  --region "${AWS_DEFAULT_REGION}" \
  --lifecycle-policy-text "file://${lifecycle_policy}" >/dev/null
echo "Applied ECR lifecycle policy from k8s/ecr-lifecycle-policy.json"
