import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

export const LLM_ENDPOINT = process.env.LLM_ENDPOINT;
export const LLM_API_KEY = process.env.API_KEY;
export const LLM_MODEL = process.env.LLM_MODEL;

export const SN_URL = process.env.SERVICENOW_URL

export const SN_PROJ = process.env.SN_ProjSys
export const SN_ACTIONTABLE = process.env.SN_ACTION_TABLE;

export const SN_USER = process.env.SERVICENOW_USER;
export const SN_PASSWORD = process.env.SERVICENOW_PASS;
