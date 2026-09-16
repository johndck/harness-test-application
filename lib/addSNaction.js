import {
  SN_URL,
  SN_USER,
  SN_PASSWORD,
  SN_PROJ,
  SN_ACTIONTABLE,
} from "../harness/config.js";

export async function addServiceNowAction({ body }) {

  if (!SN_URL || !SN_USER || !SN_PASSWORD) {
    throw new Error('Missing ServiceNow credentials in environment variables');
  }

  const url = `${SN_URL}/api/now/table/${SN_ACTIONTABLE}`;
  const credentials = Buffer.from(`${SN_USER}:${SN_PASSWORD}`).toString('base64');

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({...body, parent: SN_PROJ ?? body.parent}),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`ServiceNow API error ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  return data.result;
}



export default addServiceNowAction;
