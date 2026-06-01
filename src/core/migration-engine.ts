import type { Schema, Table, Column, Migration, ImpactFinding } from "../types.js";

export function generateMigrations(
  before: Schema,
  after: Schema
): { migrations: Migration[]; impacts: ImpactFinding[] } {
  const migrations: Migration[] = [];
  const impacts: ImpactFinding[] = [];

  // Create lookup maps
  const beforeMap = new Map(before.tables.map(t => [t.name, t]));
  const afterMap = new Map(after.tables.map(t => [t.name, t]));

  const forwardStatements: string[] = [];
  const rollbackStatements: string[] = [];

  // Check for new tables
  for (const [tableName, afterTable] of afterMap) {
    if (!beforeMap.has(tableName)) {
      forwardStatements.push(generateCreateTableSQL(afterTable));
      rollbackStatements.unshift(`DROP TABLE IF EXISTS ${tableName};`);
    }
  }

  // Check for modified and dropped tables
  for (const [tableName, beforeTable] of beforeMap) {
    const afterTable = afterMap.get(tableName);

    if (!afterTable) {
      // Table was dropped
      forwardStatements.push(`DROP TABLE IF EXISTS ${tableName};`);
      rollbackStatements.unshift(generateCreateTableSQL(beforeTable));
      
      impacts.push({
        type: "data_loss",
        severity: "error",
        table: tableName,
        message: `Table '${tableName}' will be dropped and all data lost`,
        recommendation: "Ensure data is backed up or migrated before applying"
      });
    } else {
      // Check for column changes
      const columnChanges = getColumnChanges(beforeTable, afterTable);
      
      if (columnChanges.added.length > 0) {
        for (const col of columnChanges.added) {
          forwardStatements.push(
            `ALTER TABLE ${tableName} ADD COLUMN ${formatColumn(col)};`
          );
          rollbackStatements.unshift(
            `ALTER TABLE ${tableName} DROP COLUMN ${col.name};`
          );
        }
      }

      if (columnChanges.removed.length > 0) {
        for (const col of columnChanges.removed) {
          forwardStatements.push(
            `ALTER TABLE ${tableName} DROP COLUMN ${col.name};`
          );
          rollbackStatements.unshift(
            `ALTER TABLE ${tableName} ADD COLUMN ${formatColumn(col)};`
          );

          impacts.push({
            type: "data_loss",
            severity: "error",
            table: tableName,
            message: `Column '${col.name}' will be removed`,
            details: `Column type: ${col.type}`,
            recommendation: "Ensure data is migrated or backed up first"
          });
        }
      }

      if (columnChanges.modified.length > 0) {
        for (const { before: oldCol, after: newCol } of columnChanges.modified) {
          const typeChanged = oldCol.type !== newCol.type;
          const nullabilityChanged = oldCol.nullable !== newCol.nullable;

          if (typeChanged || nullabilityChanged) {
            forwardStatements.push(
              `ALTER TABLE ${tableName} MODIFY COLUMN ${formatColumn(newCol)};`
            );
            rollbackStatements.unshift(
              `ALTER TABLE ${tableName} MODIFY COLUMN ${formatColumn(oldCol)};`
            );

            if (typeChanged) {
              impacts.push({
                type: "schema_incompatibility",
                severity: "warning",
                table: tableName,
                message: `Column '${oldCol.name}' type changed from ${oldCol.type} to ${newCol.type}`,
                recommendation: "Verify data compatibility before applying"
              });
            }
          }
        }
      }
    }
  }

  const description = `Migration from schema version ${before.version} to ${after.version}`;
  
  migrations.push({
    forward: forwardStatements.join("\n") || "-- No changes",
    rollback: rollbackStatements.join("\n") || "-- No changes",
    description
  });

  return { migrations, impacts };
}

function generateCreateTableSQL(table: Table): string {
  const columnDefs = table.columns.map(col => formatColumn(col)).join(",\n  ");
  return `CREATE TABLE IF NOT EXISTS ${table.name} (\n  ${columnDefs}\n);`;
}

function formatColumn(col: Column): string {
  let def = `${col.name} ${col.type}`;
  
  if (col.primaryKey) {
    def += " PRIMARY KEY";
  }
  if (!col.nullable && !col.primaryKey) {
    def += " NOT NULL";
  }
  if (col.default) {
    def += ` DEFAULT ${col.default}`;
  }
  if (col.autoIncrement) {
    def += " AUTO_INCREMENT";
  }

  return def;
}

interface ColumnChange {
  added: Column[];
  removed: Column[];
  modified: Array<{ before: Column; after: Column }>;
}

function getColumnChanges(before: Table, after: Table): ColumnChange {
  const beforeMap = new Map(before.columns.map(c => [c.name, c]));
  const afterMap = new Map(after.columns.map(c => [c.name, c]));

  const added: Column[] = [];
  const removed: Column[] = [];
  const modified: Array<{ before: Column; after: Column }> = [];

  for (const [colName, afterCol] of afterMap) {
    const beforeCol = beforeMap.get(colName);
    if (!beforeCol) {
      added.push(afterCol);
    } else if (
      beforeCol.type !== afterCol.type ||
      beforeCol.nullable !== afterCol.nullable ||
      beforeCol.default !== afterCol.default
    ) {
      modified.push({ before: beforeCol, after: afterCol });
    }
  }

  for (const [colName, beforeCol] of beforeMap) {
    if (!afterMap.has(colName)) {
      removed.push(beforeCol);
    }
  }

  return { added, removed, modified };
}
