# english-first

**Language-agnostic, format-agnostic English-First Reasoning policy.**

LLMs reason more accurately when prompts and intermediate steps are in English.
This repo provides a single canonical policy (`core/policy.md`) plus thin
adapters for every major agent format — so you edit **once** and deploy everywhere.

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
├── scripts/
│   └── build.py               # regenerates adapters from core/
└── .github/workflows/
    └── sync-check.yml         # CI: adapters must stay in sync
```

---

## Installation

### Claude Code skill

Copy `adapters/SKILL.md` to your Claude skills directory:

```bash
mkdir -p ~/.claude/skills/english-first
cp adapters/SKILL.md ~/.claude/skills/english-first/SKILL.md
```

The skill auto-activates when Claude detects non-English input, or invoke it explicitly:

```
/english-first
```

### Universal agents (Cursor, Zed, Aider, Codex, Cline, Roo, Windsurf…)

Drop `adapters/AGENTS.md` into your project root (or append to an existing one):

```bash
cp adapters/AGENTS.md ./AGENTS.md
# or append:
cat adapters/AGENTS.md >> ./AGENTS.md
```

### Cursor

```bash
mkdir -p .cursor/rules
cp adapters/cursor.mdc .cursor/rules/english-first.mdc
```

### OpenAI (function calling)

Add `adapters/openai_tool.json` to your tools array, plus this system instruction:

```
Before reasoning, call normalize_to_english on any non-English user input.
Reason and call other tools in English. Reply in the user's original language
unless they requested otherwise. Never translate code, logs, or quoted text.
```

### LangChain

```bash
pip install langchain-core pydantic
```

```python
from english_first.adapters.langchain_tool import NormalizeToEnglish, POLICY

# inject POLICY into your system prompt, add tool to your agent
```

Implement `_run` with your preferred translation backend (LLM call, DeepL, Google Translate, etc.).

### Any raw LLM (no framework)

Paste `adapters/system_prompt.txt` (~50 tokens) into your system message:

```
ENGLISH-FIRST REASONING: If the user's input is not English, silently
translate it to English, perform all reasoning, tool calls and retrieval
in English, then answer in the user's original language (or as explicitly
requested). Never translate code, JSON, logs, URLs, paths, identifiers,
brand names, or user-quoted text. Preserve numbers, units and intent.
```

---

## Updating the policy

Edit `core/policy.md`, then regenerate all adapters:

```bash
python scripts/build.py
```

CI will fail if any adapter drifts out of sync:

```bash
python scripts/build.py --check
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

---

## License

MIT
