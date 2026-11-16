#!/usr/bin/env bash
set -euo pipefail
: "${ENV:?ENV is required}"
: "${GITHUB_SHA:?GITHUB_SHA is required}"
case "${ENV}" in
  main) tag_env="prod" ;;
  *) tag_env="${ENV}" ;;
esac
short_sha="$(printf '%s' "${GITHUB_SHA}" | cut -c1-7)"
printf '%s\n' "${tag_env}" "${tag_env}-${short_sha}"
