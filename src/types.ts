// Input domain models
export type Column = {
  name: string;
  type: string;
  nullable: boolean;
  default?: string;
  primaryKey?: boolean;
  autoIncrement?: boolean;
};

export type Table = {
  name: string;
  columns: Column[];
  indexes?: string[];
};

export type Schema = {
  tables: Table[];
  version: string;
};

// Migration output models
export type Migration = {
  forward: string;
  rollback: string;
  description: string;
};

export type ImpactFinding = {
  type: "data_loss" | "schema_incompatibility" | "performance_warning" | "breaking_change";
  severity: "error" | "warning";
  table: string;
  message: string;
  details?: string;
  recommendation?: string;
};

export type MigrationStats = {
  tablesCreated: number;
  tablesModified: number;
  tablesDropped: number;
  columnsAdded: number;
  columnsRemoved: number;
  columnsModified: number;
  impactFindings: number;
};

export type MigrationResult = {
  project: string;
  command: string;
  summary: string;
  migrations: Migration[];
  impacts: ImpactFinding[];
  stats: MigrationStats;
};

export type RunOptions = {
  json: boolean;
  before?: string;
  after?: string;
  config?: string;
  dryrun?: boolean;
};
