#!/usr/bin/env bash
set -euo pipefail
branch="${GITHUB_REF_NAME:-main}"
case "${branch}" in
  dev) echo "dev" ;;
  stage) echo "stage" ;;
  latest|main) echo "latest" ;;
  *) echo "none" ;;
esac
