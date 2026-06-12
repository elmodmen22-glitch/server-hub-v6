#!/bin/bash
set -e

export TERM=xterm-256color
export PATH="/opt/venv/bin:$PATH"

if [ -n "$USERNAME" ]; then
    if ! id "$USERNAME" &>/dev/null; then
        useradd -m -s /bin/bash -u 1000 "$USERNAME" 2>/dev/null || true
    fi
    chown -R 1000:1000 /home/runner
fi

mkdir -p /home/runner/files /home/runner/projects /home/runner/.config

if [ -f /home/runner/.zshrc ]; then
    chown 1000:1000 /home/runner/.zshrc
fi

echo "Container ready for user: ${USERNAME:-runner}"

exec "$@"
