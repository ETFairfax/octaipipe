#!/bin/sh
# Writes the runtime config the app fetches at startup, from this environment's variables.
set -eu

: "${APP:?APP is baked in by the Dockerfile and must not be unset}"
: "${API_URL:?required -- set it in the environment overlay's ConfigMap}"

target="/usr/share/nginx/html/${APP}/config.json"

# Named args become object keys via $ARGS.named, then unset optional fields (empty string or
# null) are dropped rather than emitted empty: loadRuntimeConfig treats an absent
# signInUrl/supportEmail/appLinks/... as "feature off", and an empty string would be a lie it has
# to re-detect. --argjson parses APP_LINKS as real JSON, so a malformed value fails loudly here
# instead of silently disabling the App Switcher in the browser.
jq -n \
  --arg apiUrl "${API_URL}" \
  --arg signInUrl "${SIGN_IN_URL:-}" \
  --arg supportEmail "${SUPPORT_EMAIL:-}" \
  --argjson appLinks "${APP_LINKS:-null}" \  
  '$ARGS.named | with_entries(select(.value != null and .value != ""))' \
  > "${target}"

echo "10-runtime-config.sh: wrote ${target}"
