// tools.js
export const tools = [
  {
    type: "function",
    function: {
      name: "addServiceNowAction",
      description: "Creates a new action record in a ServiceNow table.",
      parameters: {
        type: "object",
        properties: {
          body: {
            type: "object",
            properties: {
              short_description: { type: "string" },
              description: { type: "string" },
              priority: { type: "integer" },
              parent: { type: "string" },
              work_notes: { type: "string" },
              created_by: { type: "string" },
              assigned_to: { type: "string" },
              action_due_date: { type: "string" },
            },
            required: ["short_description", "description", "priority"],
          },
        },
        required: ["body"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "addServiceNowActions",
      description:
        "Records every action from a meeting transcript, both complete and incomplete, in one call. Call exactly once; send an empty array if there are no actions.",
      parameters: {
        type: "object",
        properties: {
          actions: {
            type: "array",
            description:
              "All actions, in the order they first appear in the transcript.",
            items: {
              type: "object",
              properties: {
                status: {
                  type: "string",
                  enum: ["complete", "incomplete"],
                  description:
                    "complete if all four clarity checks (owner, task, done, due_date) passed, otherwise incomplete. Priority does not affect status.",
                },
                short_description: {
                  type: "string",
                  description:
                    "Short imperative phrase naming the deliverable, e.g. 'Send revised SOW to Acme'. Not just a project or category name.",
                },
                description: {
                  type: "string",
                  description:
                    "Full detail of the task, including what 'done' looks like and useful context from the discussion.",
                },
                assigned_to: {
                  type: "string",
                  description:
                    "Owner's name, with transcription errors corrected only where the correct spelling appears in the transcript. Omit if unknown.",
                },
                priority: {
                  type: "integer",
                  enum: [1, 2, 3],
                  description:
                    "Integer 1, 2 or 3, only if the meeting stated it. Omit otherwise.",
                },
                action_due_date: {
                  type: "string",
                  pattern: "^\\d{4}-\\d{2}-\\d{2}$",
                  description:
                    "YYYY-MM-DD, relative dates resolved against the meeting date. Omit if unknown or ambiguous.",
                },
                source_quote: {
                  type: "string",
                  description:
                    "The transcript lines this action comes from, with speaker and timestamp if available.",
                },
                missing: {
                  type: "array",
                  items: {
                    type: "string",
                    enum: ["owner", "task", "done", "due_date"],
                  },
                  description:
                    "Clarity checks that failed. Incomplete actions only; omit on complete actions.",
                },
                questions: {
                  type: "array",
                  items: { type: "string" },
                  description:
                    "One specific question per entry in missing, addressed to the meeting chair. Incomplete actions only; omit on complete actions.",
                },
              },
              required: [
                "status",
                "short_description",
                "description",
                "source_quote",
              ],
            },
          },
        },
        required: ["actions"],
      },
    },
  },
];
