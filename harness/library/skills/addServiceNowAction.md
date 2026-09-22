---
name: servicenow-add-action
description: Extracts action items from a meeting transcript and adds them to ServiceNow.
triggers: [meeting transcript, action item, commitment]
tools: [getServiceNowActions, addServiceNowAction]
---

When a meeting transcript arrives:
1. Extract each commitment made, who made it, and the deadline.
2. Call getServiceNowActions to pull the current open actions list.
3. Check the new commitment against that list — if it matches an existing
   action (same owner + same topic), update it instead of creating a
   duplicate.
4. If no match, call addServiceNowAction with action, owner, deadline.
5. If the deadline is ambiguous or missing, flag it rather than guessing.