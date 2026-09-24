// agent.js: the loop. No readline, no console.log.
import testCall from "./llmClient.js";
import { tools } from "./tools/tools.js";
import { addServiceNowAction } from "../lib/addSNaction.js";
import resolve, { isStillOnTask } from "./resolver.js";
import loadSkill from "./loadskill.js";

async function callLLM(messages, skillTools, toolChoice) {
  const hasTools = skillTools.length > 0;
  const response = await testCall(
    messages,
    hasTools ? skillTools : undefined,
    hasTools ? toolChoice : undefined   // tool_choice without tools is an API error
  );
  return response.choices[0].message;
}


async function runAgent(messages, logger, session) {
  const maxSteps = 15;

  let skillName;
if (session.activeSkill) {
  const onTask = await isStillOnTask(session.activeSkill, messages, logger);
  skillName = onTask ? session.activeSkill : await resolve(messages, logger);
} else {
  skillName = await resolve(messages, logger);
}
logger.log("skill_resolved", { skillName });


  if (skillName === "none") {
    logger.log("no_skill", { skillName });
    return { status: "done", content: "No skill matches that request." };
  }
  
  const skill = await loadSkill(skillName, logger);

  if (!skill) {
    logger.log("skill_load_failed", { skillName });
    return { status: "done", content: `Skill "${skillName}" could not be loaded.` };
  }

  session.activeSkill = skillName;

  const sys = { role: "system", content: skill.body };
if (messages[0]?.role === "system") messages[0] = sys;
else messages.unshift(sys);

const skillTools = tools.filter((t) => skill.tools.includes(t.function.name));
logger.log("skill_loaded", {
  skillName,
  requested: skill.tools,
  sent: skillTools.map((t) => t.function.name),
});

  for (let step = 1; step <= maxSteps; step++) {
    const start = Date.now();
    logger.log("llm_request", { step, messages });
    const assistantMessage = await callLLM(messages, skillTools);
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
      const handlers = { addServiceNowAction };
      try {
        const toolArgs = JSON.parse(rawArgs);



        if (!skill.tools.includes(toolName)) {
  logger.log("tool_rejected", { toolName, allowed: skill.tools });
  result = { error: `Tool ${toolName} is not allowed in this skill` };
} else {
  result = await handlers[toolName](toolArgs);
}
      } catch (error) {
        logger.error("tool_failed", error);
        result = { error: `Tool execution failed: ${error.message}` };
      }

      logger.log("tool_result", { id: toolCall.id, toolName, ms: Date.now() - toolStart, result });
      messages.push({ role: "tool", tool_call_id: toolCall.id, content: JSON.stringify(result) });


      if (!result.error) {
        session.activeSkill = null;
      }

    }

  

  }

  return { status: "max_steps" };
}

export default runAgent;