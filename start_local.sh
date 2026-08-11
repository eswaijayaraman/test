#!/usr/bin/env bash
set -e
printf 'Starting local HTTP server on port 8000...\n'
python3 -m http.server 8000
