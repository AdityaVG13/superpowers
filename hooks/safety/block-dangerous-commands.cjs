#!/usr/bin/env node

/**
 * PreToolUse hook: blocks dangerous shell commands in Bash tool calls.
 *
 * Three threat levels:
 *   critical — always blocked (rm -rf /, format, mkfs, dd of=/dev)
 *   high     — blocked by default (force push, secrets access, env dumps)
 *   strict   — opt-in (sudo, curl|wget piped to shell, chmod 777)
 *
 * Default level: high (blocks critical + high)
 *
 * Set SAFETY_LEVEL env var to "critical" or "strict" to change.
 *
 * CRITICAL FIX: The cat-secrets pattern only matches when the secrets-related
 * word is in the IMMEDIATE filename/path argument after cat/head/tail, NOT
 * anywhere in a multi-line command string.
 */

const fs = require("fs");
const path = require("path");
const os = require("os");

// --- Configuration ---

const SAFETY_LEVEL = (process.env.SAFETY_LEVEL || "high").toLowerCase();

// --- Pattern Definitions ---

const CRITICAL_PATTERNS = [
  {
    name: "rm-rf-root",
    desc: "Recursive delete of root filesystem",
    // Matches rm with any combination of -r and -f flags (combined like -rf, -fr,
    // or separate like -r -f), followed by / as the target path
    test: function (command) {
      var simpleCommands = command.split(/[;\n|&]/).map(function (s) { return s.trim(); });
      return simpleCommands.some(function (cmd) {
        // Match rm command with both -r and -f flags (in any form) targeting /
        if (!/\brm\b/.test(cmd)) return false;
        // Extract the rm portion
        var rmMatch = cmd.match(/\brm\s+(.*)/);
        if (!rmMatch) return false;
        var args = rmMatch[1];
        // Check for recursive flag
        var hasRecursive = /(-[a-zA-Z]*r[a-zA-Z]*|--recursive)/.test(args);
        // Check for force flag
        var hasForce = /(-[a-zA-Z]*f[a-zA-Z]*|--force)/.test(args);
        // Check if targeting root /
        var targetsRoot = /\s+\/(\s|$)/.test(args) || args.endsWith("/") || /\s+\/\s/.test(args);
        return hasRecursive && hasForce && targetsRoot;
      });
    },
  },
  {
    name: "format-disk",
    desc: "Disk formatting command",
    test: (cmd) => {
      // mkfs is always dangerous with a device path
      if (/\bmkfs\b.*\/(dev|disk)/i.test(cmd)) return true;
      // format must be the command itself (start of line or after ; & |), not a flag like --format
      return /(?:^|[;&|]\s*)format\b.*\/(dev|disk)/i.test(cmd);
    },
  },
  {
    name: "dd-destructive",
    desc: "dd writing to block device",
    regex: /\bdd\b.*\bof=\/dev\//i,
  },
  {
    name: "chmod-recursive-777",
    desc: "Recursive world-writable permissions on root",
    regex: /\bchmod\s+(-R|--recursive)\s+777\s+\//,
  },
  {
    name: "wipe-boot",
    desc: "Deleting boot partition or bootloader",
    regex: /\brm\b.*\/(boot|efi)\b/i,
  },
];

const HIGH_PATTERNS = [
  {
    name: "force-push-main",
    desc: "Force push to main/master branch",
    regex: /\bgit\s+push\s+.*--force.*\b(main|master)\b|\bgit\s+push\s+.*\b(main|master)\b.*--force/i,
  },
  {
    name: "git-reset-hard",
    desc: "Hard reset discarding all changes",
    regex: /\bgit\s+reset\s+--hard\b/,
  },
  {
    name: "cat-secrets",
    desc: "Reading secrets/credential files",
    // FIXED: Only matches when the secrets word is in the immediate filename argument.
    // Splits by newlines and semicolons, checks each simple command individually.
    test: function (command) {
      var simpleCommands = command.split(/[;\n]/).map(function (s) { return s.trim(); });
      var pattern = /\b(cat|less|head|tail|more)\s+\S*(credentials|secrets?|\.pem|\.key|id_rsa|id_ed25519)\S*/i;
      return simpleCommands.some(function (cmd) { return pattern.test(cmd); });
    },
  },
  {
    name: "env-dump",
    desc: "Dumping all environment variables (may contain secrets)",
    regex: /\b(env|printenv|set)\s*(\||>|$)/,
  },
  {
    name: "history-exfil",
    desc: "Reading shell history (may contain secrets)",
    regex: /\b(cat|less|head|tail|more)\s+.*\.(bash_history|zsh_history|history)/i,
  },
  {
    name: "netcat-listen",
    desc: "Opening a listening network socket",
    regex: /\b(nc|ncat|netcat)\s+.*-l/i,
  },
];

const STRICT_PATTERNS = [
  {
    name: "sudo-command",
    desc: "Running command as root",
    regex: /\bsudo\b/,
  },
  {
    name: "curl-pipe-shell",
    desc: "Piping remote script directly to shell",
    regex: /\b(curl|wget)\b.*\|\s*(bash|sh|zsh|python|node)\b/i,
  },
  {
    name: "chmod-777",
    desc: "World-writable permissions",
    regex: /\bchmod\s+777\b/,
  },
  {
    name: "npm-global-install",
    desc: "Global npm install (may require sudo, modifies system)",
    regex: /\bnpm\s+install\s+(-g|--global)\b/,
  },
];

// --- Build active pattern list based on level ---

function getActivePatterns() {
  var patterns = CRITICAL_PATTERNS.slice();
  if (SAFETY_LEVEL === "high" || SAFETY_LEVEL === "strict") {
    patterns.push.apply(patterns, HIGH_PATTERNS);
  }
  if (SAFETY_LEVEL === "strict") {
    patterns.push.apply(patterns, STRICT_PATTERNS);
  }
  return patterns;
}

// --- Logging ---

function logBlocked(command, patternName, patternDesc) {
  try {
    var homeDir = os.homedir();
    var logDir = path.join(homeDir, ".claude", "hooks-logs");
    fs.mkdirSync(logDir, { recursive: true });

    var date = new Date();
    var dateStr = date.toISOString().split("T")[0]; // YYYY-MM-DD
    var logFile = path.join(logDir, dateStr + ".jsonl");

    var entry = {
      timestamp: date.toISOString(),
      event: "blocked_command",
      pattern: patternName,
      description: patternDesc,
      command: command.substring(0, 500), // Truncate long commands
      level: SAFETY_LEVEL,
    };

    fs.appendFileSync(logFile, JSON.stringify(entry) + "\n", "utf8");
  } catch (e) {
    // Logging failure should never block the hook from responding
  }
}

// --- Main ---

function main() {
  return new Promise(function (resolve) {
    var input = "";

    // Read JSON from stdin
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", function (chunk) {
      input += chunk;
    });
    process.stdin.on("end", function () {
      var parsed;
      try {
        parsed = JSON.parse(input);
      } catch (e) {
        // If we can't parse input, allow the command (fail open)
        process.stdout.write("{}");
        resolve();
        return;
      }

      // Only check Bash tool calls
      var toolName = parsed.tool_name || "";
      if (toolName !== "Bash") {
        process.stdout.write("{}");
        resolve();
        return;
      }

      var command = (parsed.tool_input && parsed.tool_input.command) || "";
      if (!command) {
        process.stdout.write("{}");
        resolve();
        return;
      }

      // Check each active pattern
      var patterns = getActivePatterns();
      for (var i = 0; i < patterns.length; i++) {
        var pattern = patterns[i];
        var matched = false;

        if (pattern.test) {
          // Custom test function (used by cat-secrets fix and rm-rf-root)
          matched = pattern.test(command);
        } else if (pattern.regex) {
          matched = pattern.regex.test(command);
        }

        if (matched) {
          logBlocked(command, pattern.name, pattern.desc);

          var result = {
            hookSpecificOutput: {
              hookEventName: "PreToolUse",
              permissionDecision: "deny",
              permissionDecisionReason: "Blocked by safety hook [" + pattern.name + "]: " + pattern.desc + ". Override with SAFETY_LEVEL env var if intentional.",
            },
          };

          process.stdout.write(JSON.stringify(result));
          resolve();
          return;
        }
      }

      // No patterns matched — allow
      process.stdout.write("{}");
      resolve();
    });
  });
}

main().catch(function () {
  // On any unhandled error, fail open
  process.stdout.write("{}");
});
