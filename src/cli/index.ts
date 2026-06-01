import { runCore } from "../core/run-core.js";
import type { RunOptions } from "../types.js";

function printHelp(): void {
  console.log("migration-gen - Generate database migrations from schema diffs");
  console.log("");
  console.log("Usage:");
  console.log("  migration-gen --before <path> --after <path> [--json] [--dryrun] [--help]");
  console.log("");
  console.log("Options:");
  console.log("  --before <path>  Path to before schema file (required)");
  console.log("  --after <path>   Path to after schema file (required)");
  console.log("  --json           Print JSON output");
  console.log("  --dryrun         Show migrations without applying");
  console.log("  --help           Show this help message");
}

function parseArgs(args: string[]): RunOptions | null {
  const opts: RunOptions = { json: false, dryrun: false };
  let i = 0;

  while (i < args.length) {
    const arg = args[i];

    if (arg === "--json") {
      opts.json = true;
      i++;
    } else if (arg === "--dryrun") {
      opts.dryrun = true;
      i++;
    } else if (arg === "--before" && i + 1 < args.length) {
      opts.before = args[i + 1];
      i += 2;
    } else if (arg === "--after" && i + 1 < args.length) {
      opts.after = args[i + 1];
      i += 2;
    } else {
      i++;
    }
  }

  if (!opts.before || !opts.after) {
    return null;
  }

  return opts;
}

function main(): void {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes("--help")) {
    printHelp();
    process.exit(args.length === 0 ? 2 : 0);
  }

  const opts = parseArgs(args);
  if (!opts) {
    console.error("Error: --before and --after are required");
    printHelp();
    process.exit(2);
  }

  const result = runCore(opts);

  if (opts.json) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(`[${result.command}] ${result.summary}`);

    if (result.migrations.length > 0) {
      console.log("\n=== FORWARD MIGRATION ===");
      console.log(result.migrations[0].forward);
      console.log("\n=== ROLLBACK MIGRATION ===");
      console.log(result.migrations[0].rollback);
    }

    if (result.impacts.length > 0) {
      console.log("\n=== IMPACT FINDINGS ===");
      for (const impact of result.impacts) {
        const icon = impact.severity === "error" ? "❌" : "⚠️";
        console.log(`${icon} [${impact.type}] ${impact.message}`);
        if (impact.details) {
          console.log(`   ${impact.details}`);
        }
      }
    }

    console.log("\n=== STATS ===");
    console.log(`Tables Created: ${result.stats.tablesCreated}`);
    console.log(`Tables Modified: ${result.stats.tablesModified}`);
    console.log(`Tables Dropped: ${result.stats.tablesDropped}`);
    console.log(`Columns Added: ${result.stats.columnsAdded}`);
    console.log(`Columns Removed: ${result.stats.columnsRemoved}`);
    console.log(`Columns Modified: ${result.stats.columnsModified}`);
  }

  const exitCode = result.impacts.some(i => i.severity === "error") ? 1 : 0;
  process.exit(exitCode);
}

main();

