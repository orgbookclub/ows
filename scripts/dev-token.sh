#!/usr/bin/env bash
# Prints a freshly-issued OWS access token for the bundled dev client to
# stdout. Useful for shell-based testing:
#
#   TOKEN=$(./scripts/dev-token.sh)
#   curl -H "Authorization: Bearer $TOKEN" http://localhost:3000/api/health
#
# Override the target host with BASE_URL.
set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:3000}"
CLIENT_ID="${CLIENT_ID:-dev}"
CLIENT_SECRET="${CLIENT_SECRET:-dev-secret}"

response=$(curl -fsS -X POST "$BASE_URL/auth/token" \
  -H 'Content-Type: application/json' \
  -d "{
    \"grant_type\": \"client_credentials\",
    \"client_id\": \"$CLIENT_ID\",
    \"client_secret\": \"$CLIENT_SECRET\"
  }")

if command -v jq >/dev/null 2>&1; then
  printf '%s' "$response" | jq -r .access_token
else
  printf '%s\n' "$response" | sed -n 's/.*"access_token":"\([^"]*\)".*/\1/p'
fi
