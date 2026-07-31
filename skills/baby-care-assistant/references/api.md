# 宝宝 CloudBase Agent API

## Connection

- Base URL: configure with `BABY_API_BASE` or the macOS Keychain setup script
- Authentication headers:
  - `x-baby-family-code`: required except for health
  - `x-baby-caregiver-name`: percent-encoded UTF-8 helper name
- Never log either header.

## Agent conversation

`POST /agent/chat`

```json
{"message":"母乳左侧15分钟，又喝了60毫升奶粉"}
```

Important response fields:

- `status`: `completed`, `answered`, or `needs_input`
- `reply`: user-facing Agent response
- `events`: created or updated canonical event objects
- `removedIds`: identifiers removed by an explicit undo
- `cards`: structured UI summaries
- `agent.reasoning`: `rules` or `cloudbase-ai`

Conversation state is stored per caregiver. When `needs_input` is returned, submit the caregiver's next answer to the same endpoint without merging or inventing values.

## Read endpoints

- `GET /events`: newest-first events
- `GET /profile`: baby profile
- `GET /agent/session`: current caregiver conversation
- `DELETE /agent/session`: clear current caregiver conversation
- `GET /health`: service and tool registry

## Event fields

Common: `id`, `type`, `title`, `detail`, `eventAt`, `endAt`, `createdBy`, `rawText`.

Feeding additionally uses:

- `feedMode`: `breast`, `formula`, or `mixed`
- `breastMinutes`: positive integer
- `formulaMl`: positive integer
- `breastSide`: `left`, `right`, `both`, or null

## Permissions

- Dad (`super_admin`) can manage all records and edit the baby profile.
- Mom and named helpers are members and may delete or modify only their own records.
- The API, not the calling agent, is authoritative for identity and authorization.
