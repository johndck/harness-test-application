// agent.js: the loop. No readline, no console.log.
import testCall from "./llmClient.js";
import { tools } from "./tools/tools.js";
import { addServiceNowAction } from "../lib/addSNaction.js";

async function callLLM(messages) {
  const response = await testCall(messages, tools, undefined);
  return response.choices[0].message;
}

async function runAgent(messages, logger) {
  const maxSteps = 15;

  for (let step = 1; step <= maxSteps; step++) {
    const start = Date.now();
    logger.log("llm_request", { step, messages });
    const assistantMessage = await callLLM(messages);
    logger.log("llm_response", { step, ms: Date.now() - start, assistantMessage });
    messages.push(assistantMessage);

    // No tool calls means the model is finished
    if (!assistantMessage.tool_calls) {
      return { status: "done", content: assistantMessage.content };
    }

    logger.section("Tool calls");
    for (const toolCall of assistantMessage.tool_calls) {
      const toolName = toolCall.function.name;
      const rawArgs = toolCall.function.arguments;
      logger.log("tool_call", { id: toolCall.id, toolName, rawArgs });

      let result;
      const toolStart = Date.now();
      try {
        const toolArgs = JSON.parse(rawArgs);
        if (toolName === "addServiceNowAction") {
          result = await addServiceNowAction(toolArgs);
        } else {
          result = { error: `Unknown tool: ${toolName}` };
        }
      } catch (error) {
        logger.error("tool_failed", error);
        result = { error: `Tool execution failed: ${error.message}` };
      }

      logger.log("tool_result", { id: toolCall.id, toolName, ms: Date.now() - toolStart, result });
      messages.push({ role: "tool", tool_call_id: toolCall.id, content: JSON.stringify(result) });
    }
  }

  return { status: "max_steps" };
}

export default runAgent;