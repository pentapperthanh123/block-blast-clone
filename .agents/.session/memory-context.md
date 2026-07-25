# Persistent Project Memory

**Auto-loaded at session start.** Auto mode: soft-cap may defer large/old topics.

---

## Memory Index

# Memory Index

> Persistent cross-session memory for project conventions, user preferences, and key decisions.

---

## User

- [user] (Empty - add via /remember)

## Project

- [project] (Empty - add via /remember)

## Tech Decisions

- [project] (Empty - add via /remember)

## Feedback

- [feedback] (Empty - add via /remember)

---

## How Memory Works

**Auto-Loading:** The `load_memory.py` script runs at session start and injects memory content into the AI context automatically.

**Manual Loading:** If auto-load fails, AI should read this index + topic files listed above.

---

## Adding New Memory

Use the `/remember` workflow:
```
/remember [your decision or preference]
```

This will:
1. Parse the memory topic
2. Create/update the appropriate file in `.agents/memory/`
3. Update this index

---

> Last Updated: [Date] | Total Topics: 0 | Total Entries: 0


---

## Memory Topics

_(No topic bodies injected — index only or all deferred.)_

---

_Memory loaded: 2026-07-24T11:12:56.129571+00:00_