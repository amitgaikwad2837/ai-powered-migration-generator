> Mirror Policy: This repository is an automated mirror of the monorepo https://github.com/amitgaikwad2837/SDK.
>
> Do not push changes directly here. All changes must be made in the SDK monorepo and synced by workflow.
> Pull requests opened in this repo are for review visibility only and may be overwritten by the next sync.
# AI-Powered Migration Generator

Generate SQL migration plans from schema changes with review-friendly output.

## 📦 Registry & Repository

- **npm**: [@amitgaikwad37/ai-powered-migration-generator](https://www.npmjs.com/package/@amitgaikwad37/ai-powered-migration-generator)
- **GitHub**: [amitgaikwad2837/ai-powered-migration-generator](https://github.com/amitgaikwad2837/ai-powered-migration-generator)

## Overview

This SDK analyzes database schema changes and generates optimized SQL migrations (CREATE/ALTER/DROP) with rollback scripts. Supports multiple databases and integrates seamlessly into DevOps pipelines.

## Installation

~~~bash
npm install @amitgaikwad37/ai-powered-migration-generator
~~~

## Quick Start

~~~bash
npx migration-gen --help
~~~

## Integration Example

1. Add this SDK to your CI workflow or local tooling script.
2. Run the command against your project inputs.
3. Fail the pipeline on non-zero exit code to enforce quality gates.

~~~bash
npx migration-gen --before ./examples/schema-before.sql --after ./examples/schema-after.sql --dryrun --json
~~~

## Typical Output

~~~json
{
  "command": "migration-gen",
  "summary": "Generated 1 migration",
  "stats": {
    "tablesCreated": 1,
    "columnsAdded": 3
  }
}
~~~

## Local Development

~~~bash
npm ci
npm run build
npm test
~~~

## License

MIT

