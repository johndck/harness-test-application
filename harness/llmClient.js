import { LLM_ENDPOINT, LLM_API_KEY, LLM_MODEL } from "./config.js";



const API_KEY = LLM_API_KEY;
const URL = LLM_ENDPOINT;

export async function testCall(messages, tools, toolChoice) {

    const body = {
        model: LLM_MODEL,
        messages: messages,
        tools: tools,
        ...(toolChoice && { tool_choice: toolChoice }),
    };

  const response = await fetch(
    URL,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`,
      },
      body: JSON.stringify(body),
    }
  );
  const data = await response.json();
  return data;
}


export default testCall;



