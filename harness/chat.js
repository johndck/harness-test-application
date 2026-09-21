// chat.js: the only file that touches the terminal
import readline from "node:readline/promises";
import { stdin, stdout } from "node:process";
import createLogger from "./logger.js";
import runAgent from "./agent.js";

async function chat() {
  const rl = readline.createInterface({ input: stdin, output: stdout });
  const logger = createLogger("chat-interface");
  const messages = [];

  console.log("Chat started & logging initiated. Type 'exit' to quit.\n");

  while (true) {
    const input = await rl.question("Enter your prompt: ");
    if (input.toLowerCase() === "exit") break;

    messages.push({ role: "user", content: input });
    logger.section(`User message ${messages.length}`);

    const result = await runAgent(messages, logger);

    console.log(
      result.status === "done"
        ? `Assistant: ${result.content}\n`
        : `Stopped: ${result.status}\n`
    );
  }

  logger.close({ totalMessages: messages.length });
  rl.close();
}

export default chat;