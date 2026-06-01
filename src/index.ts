export { runCore } from "./core/run-core.js";
export type { MigrationResult, RunOptions, Schema, Migration, ImpactFinding } from "./types.js";
export { parseSchema } from "./adapters/schema-parser.js";
export { generateMigrations } from "./core/migration-engine.js";
