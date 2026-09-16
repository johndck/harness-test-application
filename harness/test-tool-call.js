// test-tool-call.js
import testCall from "./llmClient.js";
import { tools } from "./tools/tools.js";
import { addServiceNowAction } from "../lib/addSNaction.js";

const messages = [
  {
    role: "user",
    content: "Create a ServiceNow action in table project_action table. Parent: 'ce06dde6c35a0710d93ab813e401312c'. Short description: 'Test action for harness call with complete payload'. Description: 'Testing that the tool call flow works end to end x2'. Priority: 1. Work notes: 'This is the 1st iteration of the 2nd action for the harness call'. Created by: 'admin'. Assigned to: 'admin'. Action due date: '2026-11-01'."
  }
];

const response = await testCall(messages, tools, undefined);
console.log(JSON.stringify(response.choices[0].message, null, 2));

// --- new lines go here, after the response has arrived ---
const assistantMessage = response.choices[0].message;
const toolCall = assistantMessage.tool_calls[0];
const args = JSON.parse(toolCall.function.arguments);

console.log("Parsed args:", args);

// --- new: Step 5 ---
try {
    const result = await addServiceNowAction(args);
    console.log("ServiceNow result:", result);
  } catch (err) {
    console.error("ServiceNow call failed:", err.message);
  }
