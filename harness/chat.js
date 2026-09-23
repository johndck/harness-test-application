// chat.js: the only file that touches the terminal
import readline from "node:readline/promises";
import { stdin, stdout } from "node:process";
import createLogger from "./logger.js";
import runAgent from "./agent.js";
import fs from "node:fs/promises";

async function chat() {
  const rl = readline.createInterface({ input: stdin, output: stdout });
  const logger = createLogger("chat-interface");
  const messages = [];

  console.log("Chat started & logging initiated. Type 'exit' to quit.\n");

  while (true) {
    const input = await rl.question("Enter your prompt: ");
    if (input.toLowerCase() === "exit") break;


    let content = input;

if (input.startsWith("file:")) {
  const path = input.slice(5).trim();       // everything after "file:"
  try {
    content = await fs.readFile(path, "utf8");
    console.log(`Loaded ${path} (${content.length} characters)\n`)
    logger.section(`Loaded file ${path} (${content.length} characters)`);
    
  } catch (err) {
    console.log(`Could not read ${path}: ${err.message}\n`);
    continue;                                // go back and ask for another prompt
  }
}

    messages.push({ role: "user", content });
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