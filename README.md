# AI-Powered Migration Generator

## Overview

Generate SQL migration plans from schema changes with review-friendly output.

## Installation

~~~bash
npm install @public-sdk/ai-powered-migration-generator
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
