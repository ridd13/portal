# Paperclip Bug Report: Adapter-Retry Backoff & PATCH Reassignment Quirk

## Summary
This report covers two server-side issues in Paperclip that significantly impact autonomous operation:
1. **Lack of Backoff for Quota Errors:** Adapters move to a terminal `blocked` state too quickly when encountering provider-level limits.
2. **PATCH Reassignment Quirk:** Issues are silently reassigned to the caller when updating status without providing an explicit assignee.

---

## 1. Adapter-Failure on Quota Error (Immediate `blocked`)

### Current Behavior
When an adapter (e.g., Claude) fails due to a provider-level quota or rate limit (e.g., "Session usage limit reached"), Paperclip currently performs a single retry. If the second attempt fails—which is guaranteed if the provider's reset window hasn't passed—the issue is immediately moved to the `blocked` status.

### Reproduction
1. Execute a Paperclip adapter task until a session-specific or account-specific usage limit is triggered.
2. Observe the adapter failure and Paperclip's single retry.
3. Note the transition to `blocked` status after the second failure.

### Expected Behavior
Paperclip should recognize transient quota and rate-limit errors and apply an exponential backoff schedule before marking an issue as `blocked`. This allows autonomous agents to resume work once the provider window resets without human intervention.

### Proposed Fix
- **Exponential Backoff Schedule:** Implement a retry schedule (e.g., 5, 10, 20, 30, 60, 120 minutes) with a cap of ~6 retries over ~3 hours.
- **Quota Matching:** Explicitly match error strings for monthly usage limits, session usage limits, and provider-specific rate limits.
- **System Comments:** Enhance system-generated comments to include a retry counter and the scheduled resume time (e.g., `Retry 2/6: Claude session limit reached. Backing off for 10 minutes.`).

---

## 2. PATCH Reassignment Quirk (Side Bug)

### Current Behavior
A `PATCH` request to `/api/issues/{id}` containing `{ "status": "in_progress" }` (or other statuses that imply ownership) silently reassigns the issue to the calling agent if `assigneeAgentId` is omitted. No `409 Conflict` or `422 Unprocessable Entity` is returned; ownership is simply overwritten.

### Impact
This leads to accidental ownership theft during maintenance sweeps (e.g., a watchdog agent attempting to move a task from `blocked` to `todo` might accidentally assign it to itself if using `in_progress`).

### Proposed Fix
- Require an explicit `assigneeAgentId` if the status change implies a transition that affects ownership.
- Alternatively, preserve the existing `assigneeAgentId` if the field is omitted in the `PATCH` payload.

---

## 3. Overall Impact
These issues combined created a significant operational bottleneck:
- **CTO Outage:** The lack of backoff resulted in a **26-hour operational outage** for the CTO agent during a recent quota event.
- **Ticket Stagnation:** **12 out of 17 active tickets** (70%) were stuck in a `blocked` state, requiring manual intervention.
- **Operational Overhead:** High reliance on manual "Resume Watchdog" sweeps to reanimate stuck tasks, undermining the autonomy of the agent pool.
