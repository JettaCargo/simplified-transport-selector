#!/usr/bin/env bash
set -euo pipefail
: "${IMAGE:?IMAGE is required}"
container_id="$(docker run -d -p 18085:8085 "${IMAGE}")"
cleanup() { docker rm -f "${container_id}" >/dev/null 2>&1 || true; }
trap cleanup EXIT
for _ in $(seq 1 30); do
  if curl -fsS "http://127.0.0.1:18085/" >/dev/null; then
    echo "smoke ok"
    exit 0
  fi
  sleep 1
done
echo "smoke failed" >&2
docker logs "${container_id}" >&2 || true
exit 1
