#!/bin/bash
# auto-serve v1 — Run a server on a free port automatically
# Usage: auto-serve <command-with-{PORT}> [start_port]
# Example: auto-serve "python3 -m http.server {PORT}" 8000
# Example: auto-serve "node server.js --port {PORT}"
# Example: auto-serve "php -S 0.0.0.0:{PORT}"

CMD_TEMPLATE="$1"
START_PORT="${2:-8000}"
MAX_ATTEMPTS=100

is_port_free() {
  local port=$1
  if command -v ss &>/dev/null; then
    ! ss -tlnp "sport = :$port" 2>/dev/null | grep -q .
  elif command -v lsof &>/dev/null; then
    ! lsof -i :$port &>/dev/null
  else
    timeout 1 bash -c "echo >/dev/tcp/0.0.0.0/$port" 2>/dev/null
    return $?
  fi
  return 0
}

get_local_ip() {
  if command -v ip &>/dev/null; then
    ip -4 addr show | grep -oP 'inet \K[\d.]+' | grep -v '127.0.0.1' | head -1
  elif command -v ifconfig &>/dev/null; then
    ifconfig | grep -oP 'inet \K[\d.]+' | grep -v '127.0.0.1' | head -1
  else
    hostname -I 2>/dev/null | awk '{print $1}'
  fi
}

echo ""
echo -e "\e[38;5;46m╔═══════════════════════════════════════╗\e[0m"
echo -e "\e[38;5;46m║\e[0m  \e[1m\e[38;5;226mELMODMEN Auto-Serve\e[0m              \e[38;5;46m║\e[0m"
echo -e "\e[38;5;46m╚═══════════════════════════════════════╝\e[0m"

if [ -z "$CMD_TEMPLATE" ]; then
  echo -e "\e[1;31mUsage:\e[0m auto-serve <command-with-{PORT}> [start_port]"
  echo ""
  echo -e "\e[38;5;245mExamples:\e[0m"
  echo "  auto-serve \"python3 -m http.server {PORT}\""
  echo "  auto-serve \"node server.js --port {PORT}\" 5000"
  echo "  auto-serve \"php -S 0.0.0.0:{PORT}\""
  echo "  auto-serve \"npx serve -l {PORT}\""
  echo "  auto-serve \"npm start -- --port {PORT}\""
  exit 1
fi

PORT=$START_PORT
for ((i=0; i<MAX_ATTEMPTS; i++)); do
  if is_port_free $PORT; then
    LOCAL_IP=$(get_local_ip)
    CMD="${CMD_TEMPLATE//\{PORT\}/$PORT}"
    
    echo ""
    echo -e "  \e[38;5;46m➜\e[0m  \e[1mLocal:\e[0m   \e[38;5;87mhttp://localhost:$PORT\e[0m"
    if [ -n "$LOCAL_IP" ]; then
      echo -e "  \e[38;5;46m➜\e[0m  \e[1mNetwork:\e[0m \e[38;5;87mhttp://$LOCAL_IP:$PORT\e[0m"
    fi
    echo ""
    echo -e "  \e[38;5;245mRunning: $CMD\e[0m"
    echo ""
    echo -e "  \e[38;5;245mPress Ctrl+C to stop\e[0m"
    echo ""
    
    eval "$CMD"
    exit $?
  fi
  PORT=$((PORT + 1))
done

echo -e "\e[1;31m✖ No free port found after $MAX_ATTEMPTS attempts\e[0m"
exit 1
