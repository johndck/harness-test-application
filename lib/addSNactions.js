import { addServiceNowAction } from "./addSNaction.js";
import createLogger from "../harness/logger.js";

const logger = createLogger("addServiceNowActions");

async function addServiceNowActions({ actions }) {
  logger.section(`Adding ${actions.length} ServiceNow Actions`);
  const results = [];

  for (let i = 0; i < actions.length; i++) {
    const action = actions[i];

    try {
      const result = await addServiceNowAction({ body: action });
      results.push({
        action,
        success: true,
        result,
      });
      logger.log(`Action ${i + 1}/${actions.length} added`, {
        name: action.name,
        sysId: result.sys_id,
      });
    } catch (error) {
      results.push({
        action,
        success: false,
        error: error.message,
      });
      log.log(`Action ${i + 1}/${actions.length} FAILED`, {
        name: action.name,
        error: error.message,
      });
    }
  }

  const successCount = results.filter((r) => r.success).length;
  log.log(`Batch complete`, {
    total: actions.length,
    successful: successCount,
    failed: actions.length - successCount,
  });

  return results;
}

export default addServiceNowActions;
