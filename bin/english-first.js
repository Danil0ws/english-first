#!/usr/bin/env node
/**
 * npx english-first [command] [options]
 *
 * Commands:
 *   install [--agent <name>] [--dir <path>]   Install to a specific agent (default: auto-detect)
 *   list                                        List detected agents
 *   version                                     Show version
 */

const { execSync, spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require("os");

const PKG = require(path.join(__dirname, "../package.json"));
const ADAPTERS = path.join(__dirname, "../adapters");
const CORE = path.join(__dirname, "../core/policy.md");

// --- Agent definitions --------------------------------------------------

const AGENTS = {
  claude: {
    name: "Claude Code",
    detect: () =>
      fs.existsSync(path.join(os.homedir(), ".claude")) ||
      process.env.CLAUDE_CODE_ENTRYPOINT != null,
    install(dest) {
      const dir = dest || path.join(os.homedir(), ".claude", "skills", "english-first");
      fs.mkdirSync(dir, { recursive: true });
      fs.copyFileSync(path.join(ADAPTERS, "SKILL.md"), path.join(dir, "SKILL.md"));
      return dir;
    },
    hint: "~/.claude/skills/english-first/SKILL.md",
  },

  opencode: {
    name: "OpenCode",
    detect: () =>
      fs.existsSync(path.join(os.homedir(), ".opencode")) ||
      commandExists("opencode"),
    install(dest) {
      const dir = dest || path.join(os.homedir(), ".opencode", "rules");
      fs.mkdirSync(dir, { recursive: true });
      fs.copyFileSync(path.join(ADAPTERS, "AGENTS.md"), path.join(dir, "english-first.md"));
      return dir;
    },
    hint: "~/.opencode/rules/english-first.md",
  },

  codex: {
    name: "Codex CLI",
    detect: () => commandExists("codex"),
    install(dest) {
      // Codex reads AGENTS.md from cwd or ~/.codex/instructions/
      const dir = dest || path.join(os.homedir(), ".codex", "instructions");
      fs.mkdirSync(dir, { recursive: true });
      fs.copyFileSync(path.join(ADAPTERS, "AGENTS.md"), path.join(dir, "english-first.md"));
      return dir;
    },
    hint: "~/.codex/instructions/english-first.md",
  },

  hermes: {
    name: "Hermes Agent",
    detect: () =>
      fs.existsSync(path.join(os.homedir(), ".ia-agents")) ||
      commandExists("hermes"),
    install(dest) {
      const dir = dest || path.join(os.homedir(), ".ia-agents", "shared");
      fs.mkdirSync(dir, { recursive: true });
      fs.copyFileSync(path.join(ADAPTERS, "AGENTS.md"), path.join(dir, "english-first.md"));
      return dir;
    },
    hint: "~/.ia-agents/shared/english-first.md",
  },

  cursor: {
    name: "Cursor",
    detect: () =>
      commandExists("cursor") ||
      fs.existsSync(path.join(process.cwd(), ".cursor")),
    install(dest) {
      const dir = dest || path.join(process.cwd(), ".cursor", "rules");
      fs.mkdirSync(dir, { recursive: true });
      fs.copyFileSync(path.join(ADAPTERS, "cursor.mdc"), path.join(dir, "english-first.mdc"));
      return dir;
    },
    hint: ".cursor/rules/english-first.mdc",
  },
};

// --- Helpers ------------------------------------------------------------

function commandExists(cmd) {
  try {
    execSync(`command -v ${cmd}`, { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

function detectAgents() {
  return Object.entries(AGENTS).filter(([, a]) => {
    try { return a.detect(); } catch { return false; }
  });
}

function printHeader() {
  console.log(`\nenglish-first v${PKG.version}`);
  console.log("Language-agnostic English-First Reasoning policy\n");
}

// --- CLI ----------------------------------------------------------------

const [, , cmd, ...args] = process.argv;

switch (cmd) {
  case "version":
  case "--version":
  case "-v":
    console.log(PKG.version);
    break;

  case "list": {
    printHeader();
    const detected = detectAgents();
    if (detected.length === 0) {
      console.log("No supported agents detected.\n");
    } else {
      console.log("Detected agents:");
      detected.forEach(([key, a]) => console.log(`  ✓ ${a.name} (--agent ${key})`));
    }
    console.log("\nAll supported agents: " + Object.keys(AGENTS).join(", "));
    break;
  }

  case "install":
  case undefined: {
    printHeader();

    // Parse flags
    let targetAgent = null;
    let targetDir = null;
    for (let i = 0; i < args.length; i++) {
      if (args[i] === "--agent" && args[i + 1]) targetAgent = args[++i];
      if (args[i] === "--dir" && args[i + 1]) targetDir = args[++i];
    }

    // Determine which agents to install
    let toInstall;
    if (targetAgent) {
      if (!AGENTS[targetAgent]) {
        console.error(`Unknown agent: ${targetAgent}`);
        console.error("Available: " + Object.keys(AGENTS).join(", "));
        process.exit(1);
      }
      toInstall = [[targetAgent, AGENTS[targetAgent]]];
    } else {
      toInstall = detectAgents();
      if (toInstall.length === 0) {
        console.log("No agents auto-detected. Specify one with --agent <name>.");
        console.log("Available: " + Object.keys(AGENTS).join(", "));
        process.exit(1);
      }
      console.log(`Auto-detected ${toInstall.length} agent(s):\n`);
    }

    let installed = 0;
    for (const [key, agent] of toInstall) {
      try {
        const dest = agent.install(targetDir);
        console.log(`  ✓ ${agent.name} → ${dest}`);
        installed++;
      } catch (err) {
        console.error(`  ✗ ${agent.name}: ${err.message}`);
      }
    }

    console.log(`\n${installed}/${toInstall.length} installed.`);
    if (installed > 0) {
      console.log("\nThe english-first policy is active. Invoke with:");
      console.log("  /english-first  (Claude Code)");
      console.log("  or it applies automatically on non-English input.\n");
    }
    break;
  }

  default:
    console.error(`Unknown command: ${cmd}`);
    console.error("Usage: npx english-first [install|list|version] [--agent <name>] [--dir <path>]");
    process.exit(1);
}
