#!/usr/bin/env bash
set -euo pipefail
: "${AWS_DEFAULT_REGION:?}"
: "${ECR_REPOSITORY:?}"
if aws ecr describe-repositories --repository-names "${ECR_REPOSITORY}" --region "${AWS_DEFAULT_REGION}" >/dev/null 2>&1; then
  echo "ECR repository ${ECR_REPOSITORY} already exists"
  exit 0
fi
aws ecr create-repository \
  --repository-name "${ECR_REPOSITORY}" \
  --region "${AWS_DEFAULT_REGION}" \
  --image-scanning-configuration scanOnPush=true
