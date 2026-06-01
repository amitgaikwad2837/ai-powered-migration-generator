import { parseSchema } from "../adapters/schema-parser.js";
import { generateMigrations } from "./migration-engine.js";
import type { MigrationResult, RunOptions } from "../types.js";

export function runCore(options: RunOptions): MigrationResult {
  try {
    if (!options.before || !options.after) {
      return createErrorResult("Missing required options: --before and --after schema files");
    }

    // Parse both schemas
    const beforeSchema = parseSchema(options.before);
    const afterSchema = parseSchema(options.after);

    // Generate migrations and identify impacts
    const { migrations, impacts } = generateMigrations(beforeSchema, afterSchema);

    // Calculate statistics
    const stats = {
      tablesCreated: 0,
      tablesModified: 0,
      tablesDropped: 0,
      columnsAdded: 0,
      columnsRemoved: 0,
      columnsModified: 0,
      impactFindings: impacts.length
    };

    // Count changes by analyzing migrations
    const beforeTableNames = new Set(beforeSchema.tables.map(t => t.name));
    const afterTableNames = new Set(afterSchema.tables.map(t => t.name));

    stats.tablesCreated = Array.from(afterTableNames).filter(
      t => !beforeTableNames.has(t)
    ).length;
    
    stats.tablesDropped = Array.from(beforeTableNames).filter(
      t => !afterTableNames.has(t)
    ).length;

    stats.tablesModified = Array.from(afterTableNames).filter(
      t => beforeTableNames.has(t)
    ).length;

    // Parse SQL to count column changes
    const migrationSQL = migrations[0]?.forward || "";
    stats.columnsAdded = (migrationSQL.match(/ADD COLUMN/gi) || []).length;
    stats.columnsRemoved = (migrationSQL.match(/DROP COLUMN/gi) || []).length;
    stats.columnsModified = (migrationSQL.match(/MODIFY COLUMN/gi) || []).length;

    // Determine summary
    const totalChanges =
      stats.tablesCreated +
      stats.tablesModified +
      stats.tablesDropped +
      stats.columnsAdded +
      stats.columnsRemoved +
      stats.columnsModified;

    const summary =
      totalChanges === 0
        ? "No schema changes detected."
        : `Generated ${totalChanges} schema changes with ${impacts.length} impact findings.`;

    return {
      project: "ai-powered-migration-generator",
      command: "migration-gen",
      summary,
      migrations,
      impacts,
      stats
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return createErrorResult(message);
  }
}

function createErrorResult(message: string): MigrationResult {
  return {
    project: "ai-powered-migration-generator",
    command: "migration-gen",
    summary: `Error: ${message}`,
    migrations: [],
    impacts: [
      {
        type: "breaking_change",
        severity: "error",
        table: "system",
        message
      }
    ],
    stats: {
      tablesCreated: 0,
      tablesModified: 0,
      tablesDropped: 0,
      columnsAdded: 0,
      columnsRemoved: 0,
      columnsModified: 0,
      impactFindings: 1
    }
  };
}
