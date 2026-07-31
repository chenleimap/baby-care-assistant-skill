---
name: baby-care-assistant
description: Connect an AI agent to a private family baby-care log through its CloudBase Agent API. Use when the user asks to use 宝宝助手, 宝宝 Skill, or an agent to record, query, summarize, correct, or undo a baby's feeding, sleep, diaper, mood, or temperature records, including mixed feeding with breast minutes and formula milliliters.
---

# 宝宝助手

Use the bundled client as the only data-access path. Let the CloudBase Agent interpret care notes, maintain follow-up context, enforce caregiver permissions, and update the shared family record.

## Execute a request

1. Treat an explicit request such as “记录”“更正”“撤销” as authorization for that operation. Never infer a correction or deletion from an unrelated message.
2. Run:

   ```bash
   node <skill-dir>/scripts/baby.mjs chat "<用户原话>"
   ```

3. Read the JSON response:
   - `completed`: report the created, updated, or removed record.
   - `answered`: return the Agent's query or summary answer.
   - `needs_input`: ask the user the exact question in `reply`. On their next response, call `chat` again with only the new answer; the server remembers the pending turn for that caregiver.
4. State which caregiver created or changed a record when the response supplies that information.

Do not re-parse or independently write a successful Agent response. Do not retry a successful write.

## Read data directly

Use these commands for read-only inspection:

```bash
node <skill-dir>/scripts/baby.mjs records --limit 10
node <skill-dir>/scripts/baby.mjs records --type feed --limit 5
node <skill-dir>/scripts/baby.mjs profile
node <skill-dir>/scripts/baby.mjs health
```

Use `session` to inspect the current caregiver's pending conversation and `session --clear` only when the user explicitly asks to cancel or reset it.

## Handle credentials safely

Require `BABY_FAMILY_CODE` or the macOS Keychain entry created by `scripts/configure-macos.sh`. Never ask the user to paste a family access code into chat, print it, place it in a command argument, or save it in the Skill.

Use `BABY_CAREGIVER_NAME` for a named helper. Dad and mom identities are determined by their separate family codes on the server.

If credentials are missing, ask the user to run:

```bash
bash <skill-dir>/scripts/configure-macos.sh
```

## Guardrails

- Preserve the existing CloudBase database; never create a second baby profile or local shadow record.
- Respect server permissions: dad is super administrator; other caregivers can manage only their own records.
- Treat health observations as family notes, not medical diagnoses. For urgent symptoms, advise contacting a qualified clinician while recording only the facts the user provided.
- On a network or API error, run `health` once and report the failure without fabricating a saved record.
- Read [references/api.md](references/api.md) only when debugging the client, extending supported operations, or interpreting raw response fields.

## Examples

- “用宝宝助手记录：母乳左侧15分钟，奶粉60毫升。”
- “宝宝今天喝了多少奶？”
- “把刚才奶粉改成70毫升。”
- “撤销我上一条记录。”
