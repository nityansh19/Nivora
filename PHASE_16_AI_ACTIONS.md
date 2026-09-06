# Phase 16 — AI Actions & Automation

## What changed

Nivora Intelligence can now move from read-only financial answers to **explicit action proposals**.

Supported confirmed actions:

- Set or replace the current month's overall budget
- Create a savings goal
- Record an expense

## Safety model

Actions follow this sequence:

`User request → intent detection → action proposal → explicit confirmation → execution → success state`

The assistant never mutates finance data merely because a request contains an actionable phrase. A proposal must be shown and the user must press **Confirm**.

## Data boundaries

Phase 16 remains local-first. No financial request is sent to an external AI provider. The action layer uses Nivora's existing local domain and storage modules.

## Important prototype boundary

Natural-language extraction is intentionally deterministic and conservative. It supports common phrasing and should not be treated as a production-grade financial agent yet.

Future phases can replace intent parsing with a model gateway while keeping the confirmation boundary, typed action schema and validation layer intact.
