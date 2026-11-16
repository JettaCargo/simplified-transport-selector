#!/usr/bin/env bash
set -euo pipefail
: "${NPM_PUBLISH_TOKEN:?}"
printf '%s\n' "//registry.npmjs.org/:_authToken=${NPM_PUBLISH_TOKEN}" > .npmrc
