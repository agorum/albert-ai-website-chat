#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
EXAMPLES_DIR="${1:-examples}"

cd "$ROOT_DIR"

if [ ! -d dist ]; then
  echo "Build-Ordner nicht gefunden. Starte ./build.sh ..."
  ./build.sh
fi

node scripts/dev-server.mjs "$EXAMPLES_DIR"
