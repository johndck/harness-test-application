import dotenv from "dotenv";
dotenv.config();

import chat from './chat.js';   // chat.js: the only file that touches the terminal

await chat();

