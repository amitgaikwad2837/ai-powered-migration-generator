# AI-Powered Migration Generator Examples

## CLI Example

Run this command from your project root:

~~~bash
npx migration-gen --before ./examples/schema-before.sql --after ./examples/schema-after.sql --dryrun --json
~~~

## CI Example (GitHub Actions)

~~~yaml
- name: Run AI-Powered Migration Generator
  run: npx migration-gen --before ./examples/schema-before.sql --after ./examples/schema-after.sql --dryrun --json
~~~

## Notes

- Keep example inputs small and deterministic.
- Commit expected outputs when you want regression visibility in pull requests.
