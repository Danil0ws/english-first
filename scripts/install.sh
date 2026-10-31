#!/usr/bin/env bash
# install.sh — universal shell installer for english-first
#
# Usage:
#   curl -fsSL https://raw.githubusercontent.com/Danil0ws/english-first/main/scripts/install.sh | bash
#   curl -fsSL https://raw.githubusercontent.com/Danil0ws/english-first/v1.0.0/scripts/install.sh | bash
#
# Options (env vars):
#   AGENT=claude|opencode|codex|hermes|cursor|all   default: auto
#   VERSION=v1.0.0                                   default: main
#   DEST=/custom/path                                default: agent-specific

set -euo pipefail

REPO="Danil0ws/english-first"
VERSION="${VERSION:-main}"
BASE_URL="https://raw.githubusercontent.com/${REPO}/${VERSION}"
AGENT="${AGENT:-auto}"

red()    { echo -e "\033[0;31m$*\033[0m"; }
green()  { echo -e "\033[0;32m$*\033[0m"; }
yellow() { echo -e "\033[0;33m$*\033[0m"; }
bold()   { echo -e "\033[1m$*\033[0m"; }

fetch() {
  local url="$1" dest="$2"
  mkdir -p "$(dirname "$dest")"
  if command -v curl &>/dev/null; then
    curl -fsSL "$url" -o "$dest"
  elif command -v wget &>/dev/null; then
    wget -qO "$dest" "$url"
  else
    red "Error: curl or wget required."
    exit 1
  fi
}

detect_agents() {
  local found=()
  command -v claude  &>/dev/null && found+=("claude")
  [ -d "$HOME/.claude" ]         && found+=("claude")
  command -v opencode &>/dev/null && found+=("opencode")
  [ -d "$HOME/.opencode" ]        && found+=("opencode")
  command -v codex   &>/dev/null && found+=("codex")
  [ -d "$HOME/.codex" ]          && found+=("codex")
  command -v hermes  &>/dev/null && found+=("hermes")
  [ -d "$HOME/.ia-agents" ]      && found+=("hermes")
  command -v cursor  &>/dev/null && found+=("cursor")
  [ -d ".cursor" ]               && found+=("cursor")

  # deduplicate
  printf '%s\n' "${found[@]}" | sort -u
}

install_claude() {
  local dest="${DEST:-$HOME/.claude/skills/english-first}"
  bold "Installing for Claude Code → $dest"
  fetch "$BASE_URL/adapters/SKILL.md" "$dest/SKILL.md"
  green "  ✓ Claude Code: $dest/SKILL.md"
}

install_opencode() {
  local dest="${DEST:-$HOME/.opencode/rules}"
  bold "Installing for OpenCode → $dest"
  fetch "$BASE_URL/adapters/AGENTS.md" "$dest/english-first.md"
  green "  ✓ OpenCode: $dest/english-first.md"
}

install_codex() {
  local dest="${DEST:-$HOME/.codex/instructions}"
  bold "Installing for Codex CLI → $dest"
  fetch "$BASE_URL/adapters/AGENTS.md" "$dest/english-first.md"
  green "  ✓ Codex: $dest/english-first.md"
}

install_hermes() {
  local dest="${DEST:-$HOME/.ia-agents/shared}"
  bold "Installing for Hermes → $dest"
  fetch "$BASE_URL/adapters/AGENTS.md" "$dest/english-first.md"
  green "  ✓ Hermes: $dest/english-first.md"
}

install_cursor() {
  local dest="${DEST:-.cursor/rules}"
  bold "Installing for Cursor → $dest"
  fetch "$BASE_URL/adapters/cursor.mdc" "$dest/english-first.mdc"
  green "  ✓ Cursor: $dest/english-first.mdc"
}

echo ""
bold "english-first installer (${VERSION})"
echo "Repo: https://github.com/${REPO}"
echo ""

installed=0

if [ "$AGENT" = "auto" ]; then
  mapfile -t agents < <(detect_agents)
  if [ ${#agents[@]} -eq 0 ]; then
    yellow "No supported agents detected. Set AGENT=<name> to install manually."
    yellow "Supported: claude, opencode, codex, hermes, cursor, all"
    exit 1
  fi
  bold "Detected: ${agents[*]}"
  echo ""
  for a in "${agents[@]}"; do
    "install_$a" && ((installed++)) || true
  done
elif [ "$AGENT" = "all" ]; then
  for a in claude opencode codex hermes cursor; do
    "install_$a" && ((installed++)) || true
  done
else
  "install_${AGENT}" && ((installed++))
fi

echo ""
green "Done. ${installed} adapter(s) installed."
echo ""
echo "To activate in Claude Code: /english-first"
echo "In other agents: the policy applies automatically on non-English input."
echo ""
