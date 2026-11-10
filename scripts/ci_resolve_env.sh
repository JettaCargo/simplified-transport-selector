#!/usr/bin/env bash
set -euo pipefail
branch="${GITHUB_REF_NAME:-main}"
case "${branch}" in
  dev) echo "dev" ;;
  stage) echo "stage" ;;
  main) echo "main" ;;
  *) echo "none" ;;
esac
