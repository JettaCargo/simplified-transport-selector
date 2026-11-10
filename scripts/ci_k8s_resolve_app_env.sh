#!/usr/bin/env bash
set -euo pipefail
: "${DEPLOY_ENV:?DEPLOY_ENV is required}"
case "${DEPLOY_ENV}" in
  dev) echo "dev" ;;
  stage) echo "stage" ;;
  latest) echo "prod" ;;
  *) echo "unsupported deploy env: ${DEPLOY_ENV}" >&2; exit 1 ;;
esac
