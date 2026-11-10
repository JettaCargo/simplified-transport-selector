#!/usr/bin/env bash
set -euo pipefail
: "${AWS_DEFAULT_REGION:?}"
: "${AWS_ACCOUNT_ID:?}"
aws ecr get-login-password --region "${AWS_DEFAULT_REGION}" \
  | docker login --username AWS --password-stdin \
    "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_DEFAULT_REGION}.amazonaws.com"
