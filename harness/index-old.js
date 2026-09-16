

import testCall from './llmClient.js';


const messages = [{ role: "user", content: "What is the capital of UK." }];
const tools = [];
const toolChoice = null;

testCall(messages, tools, toolChoice);


const response = await testCall(messages, tools, toolChoice);
console.log(response.choices[0].message.content);