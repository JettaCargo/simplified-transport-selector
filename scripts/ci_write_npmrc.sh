#!/usr/bin/env bash
set -euo pipefail
: "${NPM_TOKEN:?}"
printf '%s\n' "//registry.npmjs.org/:_authToken=${NPM_TOKEN}" > .npmrc
