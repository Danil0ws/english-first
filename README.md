# english-first

**Language-agnostic, format-agnostic English-First Reasoning policy.**

LLMs reason more accurately when prompts and intermediate steps are in English.
This repo provides a single canonical policy (`core/policy.md`) plus thin
adapters for every major agent format — so you edit **once** and deploy everywhere.

---

## Quick install

### npx skills (recommended — installs to any agent automatically)

```bash
# install to all detected agents in current project
npx skills add Danil0ws/english-first

# install globally (available across all projects)
npx skills add -g Danil0ws/english-first

# specific agent
npx skills add Danil0ws/english-first -a claude-code
npx skills add Danil0ws/english-first -a opencode
npx skills add Danil0ws/english-first -a codex
npx skills add Danil0ws/english-first -a cursor

# use without installing (one-shot)
npx skills use Danil0ws/english-first@english-first --agent claude-code

# pinned version
npx skills add Danil0ws/english-first@v1.0.0
```

Requires Node.js ≥ 22.20. Supports 75+ agents. See [skills.sh](https://skills.sh) for the full agent list.

---

### npx (any machine with Node ≥ 18)

```bash
# auto-detect installed agents
npx english-first

# target a specific agent
npx english-first install --agent claude
npx english-first install --agent opencode
npx english-first install --agent codex
npx english-first install --agent hermes
npx english-first install --agent cursor

# custom destination
npx english-first install --agent claude --dir /path/to/skills/english-first

# list detected agents
npx english-first list
```

### curl / bash

```bash
# latest (main)
curl -fsSL https://raw.githubusercontent.com/Danil0ws/english-first/main/scripts/install.sh | bash

# pinned version (recommended for CI / reproducible envs)
curl -fsSL https://raw.githubusercontent.com/Danil0ws/english-first/v1.0.0/scripts/install.sh | bash

# specific agent
AGENT=claude  curl -fsSL https://raw.githubusercontent.com/Danil0ws/english-first/main/scripts/install.sh | bash
AGENT=opencode curl -fsSL https://raw.githubusercontent.com/Danil0ws/english-first/main/scripts/install.sh | bash
AGENT=codex   curl -fsSL https://raw.githubusercontent.com/Danil0ws/english-first/main/scripts/install.sh | bash
AGENT=hermes  curl -fsSL https://raw.githubusercontent.com/Danil0ws/english-first/main/scripts/install.sh | bash
AGENT=cursor  curl -fsSL https://raw.githubusercontent.com/Danil0ws/english-first/main/scripts/install.sh | bash
AGENT=all     curl -fsSL https://raw.githubusercontent.com/Danil0ws/english-first/main/scripts/install.sh | bash

# custom destination
AGENT=claude DEST=~/my-skills/english-first \
  curl -fsSL https://raw.githubusercontent.com/Danil0ws/english-first/main/scripts/install.sh | bash
```

### GitHub pinned (version-controlled)

```bash
# clone at a specific tag
git clone --depth 1 --branch v1.0.0 https://github.com/Danil0ws/english-first.git
cd english-first && node bin/english-first.js install
```

---

## Per-agent install paths

| Agent | Installed file | Auto-detect condition |
|---|---|---|
| **Claude Code** | `~/.claude/skills/english-first/SKILL.md` | `~/.claude` exists or `CLAUDE_CODE_ENTRYPOINT` set |
| **OpenCode** | `~/.opencode/rules/english-first.md` | `opencode` in PATH or `~/.opencode` exists |
| **Codex CLI** | `~/.codex/instructions/english-first.md` | `codex` in PATH or `~/.codex` exists |
| **Hermes** | `~/.ia-agents/shared/english-first.md` | `hermes` in PATH or `~/.ia-agents` exists |
| **Cursor** | `.cursor/rules/english-first.mdc` | `cursor` in PATH or `.cursor/` in cwd |

---

## Manual install

### Claude Code

```bash
mkdir -p ~/.claude/skills/english-first
curl -fsSL https://raw.githubusercontent.com/Danil0ws/english-first/main/adapters/SKILL.md \
  -o ~/.claude/skills/english-first/SKILL.md
```

Invoke: `/english-first` or it activates automatically on non-English input.

### OpenCode / Codex / Hermes / any AGENTS.md agent

```bash
# append to existing AGENTS.md in your project
curl -fsSL https://raw.githubusercontent.com/Danil0ws/english-first/main/adapters/AGENTS.md \
  >> ./AGENTS.md
```

### Cursor

```bash
mkdir -p .cursor/rules
curl -fsSL https://raw.githubusercontent.com/Danil0ws/english-first/main/adapters/cursor.mdc \
  -o .cursor/rules/english-first.mdc
```

### OpenAI function calling

Add [`adapters/openai_tool.json`](adapters/openai_tool.json) to your tools array, plus this system instruction:

```
Before reasoning, call normalize_to_english on any non-English user input.
Reason and call other tools in English. Reply in the user's original language
unless they requested otherwise. Never translate code, logs, or quoted text.
```

### LangChain

```python
from english_first.adapters.langchain_tool import NormalizeToEnglish, POLICY

# inject POLICY into your system prompt, add NormalizeToEnglish to your agent tools
# implement _run with your preferred translation backend (LLM call, DeepL, etc.)
```

### Any raw LLM (~50 tokens)

Paste [`adapters/system_prompt.txt`](adapters/system_prompt.txt) into your system message:

```
ENGLISH-FIRST REASONING: If the user's input is not English, silently
translate it to English, perform all reasoning, tool calls and retrieval
in English, then answer in the user's original language (or as explicitly
requested). Never translate code, JSON, logs, URLs, paths, identifiers,
brand names, or user-quoted text. Preserve numbers, units and intent.
```

---

## How it works

```
User input (any language)
       │
       ▼
  [detect language]
       │  not English
       ▼
  translate → English  (silent, internal)
       │
       ▼
  ALL reasoning / tool calls / retrieval  ←── in English
       │
       ▼
  [translate back]
       │
       ▼
  Answer in user's language  (code/logs unchanged)
```

---

## Repo layout

```
english-first/
├── core/
│   └── policy.md              # single source of truth
├── adapters/
│   ├── SKILL.md               # Claude Code / Agent skills
│   ├── AGENTS.md              # universal (Cursor, Zed, Aider, Codex, Cline…)
│   ├── cursor.mdc             # → .cursor/rules/english-first.mdc
│   ├── openai_tool.json       # OpenAI function spec
│   ├── langchain_tool.py      # LangChain BaseTool
│   └── system_prompt.txt      # ~50-token inline fallback
├── bin/
│   └── english-first.js       # npx entry point
├── scripts/
│   ├── build.py               # regenerates adapters from core/
│   └── install.sh             # curl-pipe installer
└── .github/workflows/
    ├── sync-check.yml         # CI: adapters must stay in sync with core/
    └── release.yml            # auto-publishes GitHub releases on vX.Y.Z tags
```

---

## Updating the policy

Edit `core/policy.md`, then regenerate all adapters:

```bash
python3 scripts/build.py
```

CI fails if any adapter drifts out of sync:

```bash
python3 scripts/build.py --check
```

---

## What is never translated

| Type | Examples |
|---|---|
| Code blocks | `js`, `py`, `sh`, `sql`, … |
| Structured data | JSON, YAML, XML, TOML, diffs |
| Runtime output | logs, stack traces, terminal output |
| Locators | URLs, file paths, env vars, identifiers |
| Proper nouns | brand names, library names, framework names |
| Quoted text | error messages, docs the user pasted |

---

## Why this works everywhere

| Concern | Solution |
|---|---|
| Any language | Detection is generic; no `pt-BR` hardcoded |
| Any model | Plain English prose — no API dependency |
| Any format | Adapters are ~10-line wrappers around `core/policy.md` |
| Any agent framework | `AGENTS.md` alone covers Cursor, Zed, Aider, Codex, Cline… |
| Tool-calling models | Callable `normalize_to_english` variant |
| No-tool models | One-paragraph system prompt fallback |
| Maintenance | Single `core/policy.md` + `build.py` regenerator |
| Pinned installs | Every release tagged `vX.Y.Z` on GitHub |

---

## License

MIT
