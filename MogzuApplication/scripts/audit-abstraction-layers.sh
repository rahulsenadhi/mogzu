#!/usr/bin/env bash
# Phase 2 Feature 10 — abstraction-layer audit.
#
# Fails if components leak Supabase calls outside the four abstraction
# modules (auth.ts, db.ts, storage.ts, realtime.ts). Keeps the future
# migration cost bounded.
#
# Usage: bash scripts/audit-abstraction-layers.sh

set -e
cd "$(dirname "$0")/.."

ROOT="src"
COMPONENTS="${ROOT}/app/components ${ROOT}/app/pages"
LIB="${ROOT}/lib"

fail=0

require_file() {
  if [ ! -f "$1" ]; then
    echo "MISSING abstraction layer: $1"
    fail=1
  fi
}

require_file "${LIB}/auth.ts"
require_file "${LIB}/db.ts"
require_file "${LIB}/storage.ts"
require_file "${LIB}/realtime.ts"

scan() {
  local label="$1"
  local pattern="$2"
  local hits
  hits=$(grep -rln "${pattern}" ${COMPONENTS} 2>/dev/null || true)
  if [ -n "${hits}" ]; then
    local count
    count=$(echo "${hits}" | wc -l)
    echo "❌ ${label}: ${count} file(s) leak ${pattern}"
    echo "${hits}" | sed 's/^/   - /'
    fail=1
  else
    echo "✅ ${label}: clean"
  fi
}

scan "raw db calls"       "supabase\.from("
scan "raw auth calls"     "supabase\.auth\."
scan "raw storage calls"  "supabase\.storage\."
scan "raw realtime calls" "supabase\.channel("

if [ $fail -ne 0 ]; then
  echo ""
  echo "Audit failed. Route the offending calls through src/lib/*.ts."
  exit 1
fi

echo ""
echo "Abstraction audit passed."
