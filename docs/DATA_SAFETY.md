# Nivora Data Safety

Nivora handles personal finance information, so development should minimize unnecessary exposure of user data.

## Core principles

- Collect only data the product actually needs.
- Keep secrets and service-role credentials out of client code.
- Prefer least-privilege access for cloud services.
- Avoid logging full transaction payloads in production.
- Treat imports and exports as sensitive user-controlled files.

## Development data

Use synthetic accounts, categories, balances, and transactions while testing. Screenshots used in documentation should not reveal real financial details.

## Sync behavior

Cloud sync should fail safely. A network or authentication error must not silently overwrite a newer local record. Conflict handling should preserve enough information to recover the user's latest valid data.

## Destructive actions

Delete and reset flows should be explicit and difficult to trigger accidentally. When practical, provide a confirmation step and a clear description of what will be removed.

## Review checklist

Before releasing persistence changes, verify authentication boundaries, read/write permissions, import validation, export behavior, and recovery after interrupted sync.
