#!/bin/bash
# scripts/wait-for-url.sh
# Usage: ./scripts/wait-for-url.sh https://your-store.myshopify.com 30

URL=$1
MAX_ATTEMPTS=${2:-30}
ATTEMPT=0

echo "⏳ Waiting for $URL to respond..."

until curl --silent --fail --max-time 5 "$URL" > /dev/null 2>&1; do
  ATTEMPT=$((ATTEMPT + 1))
  if [ $ATTEMPT -ge $MAX_ATTEMPTS ]; then
    echo "❌ $URL did not respond after $MAX_ATTEMPTS attempts. Aborting."
    exit 1
  fi
  echo "  Attempt $ATTEMPT/$MAX_ATTEMPTS — retrying in 5s..."
  sleep 5
done

echo "✅ $URL is up and responding."