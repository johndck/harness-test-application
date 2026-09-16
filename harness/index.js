import dotenv from "dotenv";
dotenv.config();

import chatLoop from './orchestrator.js';

await chatLoop();

