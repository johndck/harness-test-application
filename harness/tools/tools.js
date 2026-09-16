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
              action_due_date: { type: "string" }
            },
            required: ["short_description", "description", "priority"]
          }
        },
        required: ["body"]
      }
    }
  }
];