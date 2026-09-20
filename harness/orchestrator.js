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
    const userInput = await rl.question("Enter your prompt: ");
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

    let currentMessage = assistantMessage;
    let round = 1;

    if (!currentMessage.tool_calls) {
      console.log(`Assistant: ${currentMessage.content}\n`);   // NEW: handles the no-tool-call case
    }

    while (currentMessage.tool_calls) {

      logger.section("Tool calls");


      for (const toolCall of currentMessage.tool_calls) {
        const toolName = toolCall.function.name;
        const rawArgs = toolCall.function.arguments; 
        console.log(`Here is the tool call: ${toolName}`);

        

        logger.log("tool_call", { id: toolCall.id, toolName, rawArgs });


        let result;
        const toolStart = Date.now();

        try{

          const toolArgs = JSON.parse(rawArgs);          // moved inside: this is the line that can throw
    console.log(`Tool Args: ${JSON.stringify(toolArgs)}`);
    

          if (toolName === "addServiceNowAction") {
            result = await addServiceNowAction(toolArgs);
            
          } else {
            logger.error("tool_failed", { toolName });  
            result={error: `Unknown tool: ${toolName}`};
          }

        }
        catch(error){
          logger.error("tool_failed", error);
          result={error: `Tool execution failed: ${error.message}`};

        };

        logger.log("tool_result", {                                        // NEW
          id: toolCall.id,
          toolName,
          ms: Date.now() - toolStart,
          result,
        });



        messages.push({ role: "tool", tool_call_id: toolCall.id, content: JSON.stringify(result)});
      }

      logger.section("Next LLM response");  
      const timeNow = Date.now();
      currentMessage = await callLLM(messages, tools, undefined);

      logger.log("llm_response", {                                         // NEW
        step: `after_tool_results_round_${round}`,
        ms: Date.now() - timeNow,
        finalMessage: currentMessage,
      });


      
      messages.push(currentMessage);
      round++;

      
    };

    console.log(`Assistant: ${currentMessage.content}\n`);
  }
  logger.close({ totalMessages: messages.length });
  rl.close();
}
export default chatLoop;