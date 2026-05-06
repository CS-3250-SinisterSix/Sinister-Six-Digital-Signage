#!/usr/bin/env bash
# start-signage.sh — Launch the digital signage app in kiosk mode
# Intended for Raspberry Pi (Raspbian/Raspberry Pi OS)

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PORT=8080
URL="http://localhost:${PORT}/index.html"

# --- Start local HTTP server ---
echo "Starting HTTP server on port ${PORT}..."
python3 -m http.server "$PORT" --directory "$SCRIPT_DIR" &
SERVER_PID=$!

# Clean up server on exit
cleanup() {
  echo "Shutting down HTTP server (PID ${SERVER_PID})..."
  kill "$SERVER_PID" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

# Give the server a moment to start
sleep 2

# --- Detect Chromium binary ---
if command -v chromium-browser >/dev/null 2>&1; then
  CHROMIUM=chromium-browser
elif command -v chromium >/dev/null 2>&1; then
  CHROMIUM=chromium
else
  echo "Error: Chromium not found. Install with: sudo apt install chromium-browser"
  exit 1
fi

echo "Launching ${CHROMIUM} in kiosk mode..."
"$CHROMIUM" \
  --kiosk \
  --noerrdialogs \
  --disable-infobars \
  --disable-restore-session-state \
  --start-fullscreen \
  "$URL"
