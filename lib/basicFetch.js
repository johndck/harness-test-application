import dotenv from 'dotenv';
dotenv.config();


const API_KEY = process.env.API_KEY;
const URL = "https://pa-agent-poc-resource.services.ai.azure.com/api/projects/pa-agent-poc/openai/v1/chat/completions"

export async function testCall() {

  const response = await fetch(
    URL,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: "kimi-k2.6",
        messages: [{ role: "user", content: "What is the capital of France." }],
      }),
    }
  );
  const data = await response.json();
  console.log(data.choices[0].message.content);
}


export default testCall;



