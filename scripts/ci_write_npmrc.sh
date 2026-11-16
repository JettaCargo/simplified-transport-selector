#!/usr/bin/env bash
set -euo pipefail
: "${NPM_PUBLISH_TOCKEN:?}"
printf '%s\n' "//registry.npmjs.org/:_authToken=${NPM_PUBLISH_TOCKEN}" > .npmrc
