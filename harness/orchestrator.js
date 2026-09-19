// orchestrator.js
import readline from "node:readline/promises";
import { stdin, stdout } from "node:process";
import testCall from "./llmClient.js";
import { tools } from "./tools/tools.js";
import { addServiceNowAction } from "../lib/addSNaction.js";
import createLogger from "./logger.js";



const rl = readline.createInterface({ input: stdin, output: stdout });

async function callLLM(messages, tools, toolChoice) {
  // log("llm_request", { messages, tools: tools.map(t => t.function.name) });
  const response = await testCall(messages, tools, undefined);
  const assistantMessage = response.choices[0].message;
  //log("llm_response", { message: assistantMessage });
  return assistantMessage;
}


async function chatLoop() {
  const logger = createLogger("orchestrator");
  const messages = []; // grows every turn — this IS the conversation history

  console.log("Chat started & logging initiated. Type 'exit' to quit.\n");

  while (true) {
    const userInput = await rl.question("You: ");
    if (userInput.toLowerCase() === "exit"){
        console.log(JSON.stringify(messages, null, 2));
        console.log("--------------------------------");
        break;
    }
        

    messages.push({ role: "user", content: userInput });

    logger.section(`User message ${messages.length}`);     // NEW
    logger.log("llm_request", {                            // NEW
      messageCount: messages.length,
      newMessage: messages[messages.length - 1],
      tools: tools.map((t) => t.function?.name),
    });

    const timeNow = Date.now();


    const assistantMessage = await callLLM(messages, tools, undefined);

    logger.log("llm_response", {                           // NEW
      ms: Date.now() - timeNow,
      assistantMessage,
    });

    messages.push(assistantMessage); // add the reply to history too

    if (assistantMessage.tool_calls) {
      for (const toolCall of assistantMessage.tool_calls) {
        const toolName = toolCall.function.name;
        const toolArgs = JSON.parse(toolCall.function.arguments);
        console.log(`Tool: ${toolName}`);
        console.log(`Tool Args: ${JSON.stringify(toolArgs)}`);

        let result;

        try{

          if (toolName === "addServiceNowAction") {
            result = await addServiceNowAction(toolArgs);
          } else {
            result={error: `Unknown tool: ${toolName}`};
          }

        }
        catch(error){
          result={error: `Tool execution failed: ${error.message}`};
        };
        messages.push({ role: "tool", tool_call_id: toolCall.id, content: JSON.stringify(result)});
      }

      const finalMessage = await callLLM(messages, tools, undefined);
      messages.push(finalMessage);

      console.log(`Assistant: ${finalMessage.content}\n`);

    } else{
      console.log(`Assistant: ${assistantMessage.content}\n`);
    };

  }

  logger.close({ totalMessages: messages.length });  
  rl.close();
}

export default chatLoop;