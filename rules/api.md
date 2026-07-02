# Rule: API & Backend Best Practices

## Error handling
- Every route is wrapped so thrown errors reach a **single error-handling middleware**
  (registered last). No bare `try/catch` that swallows errors silently.
- **Consistent error shape** for all failures:
  ```json
  { "error": { "code": "VALIDATION_ERROR", "message": "score must be a non-negative integer" } }
  ```
- **Correct status codes:** 200 OK, 201 Created (POST insert), 400 bad input,
  404 unknown route, 500 unexpected. Never return 200 with an error body.
- **Never leak internals** (stack traces, SQL, file paths) to the client. Log them
  server-side; return a generic message for 500s.

## Validation
- Validate and normalize **every** incoming field at the boundary before touching the DB.
- Rules per `plan.md`: username 1–20 chars trimmed (fallback `"ANON"`); score/level/lines
  non-negative integers; difficulty ∈ {easy, medium, hard}. Reject with 400 otherwise.
- Whitelist query params (`difficulty ∈ {all,easy,medium,hard}`, `limit` clamped to 1–100).

## Database
- **Prepared statements only.** No string concatenation / interpolation into SQL — ever.
- Open the DB once at startup; reuse prepared statements. Run schema idempotently
  (`CREATE TABLE IF NOT EXISTS`).
- Keep all SQL in `server/db.js`; routes call named query functions, not raw SQL.

## Logging
- Log each request: method, path, status, duration (ms). One structured line per request.
- Log errors with context (route + message + stack) at error level.
- No `console.log` debris left in committed code — use one small logger helper.

## Structure
- Thin routes: parse → validate → call db function → shape response. Business rules
  (ranking, sorting) live in `db.js`, not inline in the handler.
