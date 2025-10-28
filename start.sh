#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
EXAMPLES_DIR="${1:-examples}"
PROXY_PORT="${PROXY_PORT:-8010}"
PROXY_TARGET="${PROXY_TARGET:-https://www.agorum.com/albert/chat}"

cd "$ROOT_DIR"

if [ ! -d dist ]; then
  echo "Build folder not found. Running ./build.sh ..."
  ./build.sh
fi

echo "Starting local CORS proxy for ${PROXY_TARGET} on port ${PROXY_PORT} ..."
node scripts/cors-proxy.mjs "$PROXY_TARGET" "$PROXY_PORT" &
PROXY_PID=$!

cleanup() {
  if kill -0 "$PROXY_PID" >/dev/null 2>&1; then
    kill "$PROXY_PID"
  fi
}

trap cleanup EXIT INT TERM

export ALBERT_CHAT_PROXY_ENDPOINT="http://localhost:${PROXY_PORT}"

node scripts/dev-server.mjs "$EXAMPLES_DIR"
