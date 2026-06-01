import { describe, expect, it } from "vitest";
import { runCore } from "../../src/core/run-core.js";
import { resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const fixturesDir = resolve(__dirname, "../fixtures");

describe("migration-gen core", () => {
  it("returns basic result structure", () => {
    // Verify SDK returns migration generator output with migrations list, impacts analysis, and stats
    const result = runCore({ json: false });
    expect(result.command).toBe("migration-gen");
    expect(result.project).toBe("ai-powered-migration-generator");
    expect(result.migrations).toBeDefined();
    expect(result.impacts).toBeDefined();
    expect(result.stats).toBeDefined();
  });

  it("generates migrations from schema diff", () => {
    // Verify SDK generates forward (up) and rollback (down) SQL migrations from schema changes
    const result = runCore({
      json: false,
      before: `${fixturesDir}/schema-before.json`,
      after: `${fixturesDir}/schema-after.json`
    });

    expect(result.migrations.length).toBe(1);
    expect(result.migrations[0].forward).toBeDefined();
    expect(result.migrations[0].rollback).toBeDefined();
  });

  it("detects column additions", () => {
    // Verify SDK identifies new columns added to tables and generates ADD COLUMN statements
    const result = runCore({
      json: false,
      before: `${fixturesDir}/schema-before.json`,
      after: `${fixturesDir}/schema-after.json`
    });

    const forward = result.migrations[0].forward;
    expect(forward).toContain("ADD COLUMN");
    expect(result.stats.columnsAdded).toBeGreaterThan(0);
  });

  it("detects column modifications", () => {
    // Verify SDK identifies column type/constraint changes and generates MODIFY COLUMN statements
    const result = runCore({
      json: false,
      before: `${fixturesDir}/schema-before.json`,
      after: `${fixturesDir}/schema-after.json`
    });

    const forward = result.migrations[0].forward;
    expect(forward).toContain("MODIFY COLUMN");
    expect(result.stats.columnsModified).toBeGreaterThan(0);
  });

  it("detects new table creation", () => {
    const result = runCore({
      json: false,
      before: `${fixturesDir}/schema-before.json`,
      after: `${fixturesDir}/schema-after.json`
    });

    expect(result.stats.tablesCreated).toBe(1); // comments table added
    const forward = result.migrations[0].forward;
    expect(forward).toContain("CREATE TABLE");
  });

  it("identifies schema risks and impacts", () => {
    const result = runCore({
      json: false,
      before: `${fixturesDir}/schema-before.json`,
      after: `${fixturesDir}/schema-after.json`
    });

    expect(result.impacts.length).toBeGreaterThan(0);
    const impactTypes = result.impacts.map(i => i.type);
    expect(impactTypes).toContain("schema_incompatibility");
  });

  it("generates valid SQL statements", () => {
    const result = runCore({
      json: false,
      before: `${fixturesDir}/schema-before.json`,
      after: `${fixturesDir}/schema-after.json`
    });

    const forward = result.migrations[0].forward;
    // Check for valid SQL patterns
    expect(forward).toMatch(/ALTER TABLE|CREATE TABLE/);
    expect(forward).toMatch(/;/); // Should have statement terminators
  });

  it("handles missing schema files gracefully", () => {
    const result = runCore({
      json: false,
      before: "/nonexistent/schema.json",
      after: "/nonexistent/schema.json"
    });

    expect(result.impacts.length).toBeGreaterThan(0);
    expect(result.impacts[0].severity).toBe("error");
  });
});
