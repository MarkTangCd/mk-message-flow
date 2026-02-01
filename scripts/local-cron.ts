import cron from "node-cron";

const CRON_SCHEDULE = "*/1 * * * *";
const ENDPOINT_URL = "http://localhost:3000/api/cron/execute-schedules";

console.log("[Local Cron] Starting local cron job...");
console.log(`[Local Cron] Will trigger: ${ENDPOINT_URL}`);
console.log(`[Local Cron] Schedule: Every 5 minutes (${CRON_SCHEDULE})`);
console.log("[Local Cron] Press Ctrl+C to stop\n");

cron.schedule(CRON_SCHEDULE, async () => {
  const timestamp = new Date().toISOString();
  console.log(`[Local Cron] ${timestamp} - Triggering scheduled tasks...`);

  try {
    const response = await fetch(ENDPOINT_URL);
    const data = await response.json();

    if (data.success) {
      if (data.executed === 0) {
        console.log(`[Local Cron] ${timestamp} - No schedules due`);
      } else {
        console.log(`[Local Cron] ${timestamp} - Executed ${data.executed} schedule(s) (Asia/Shanghai timezone)`);
        data.results.forEach((result: { scheduleName: string; status: string; message?: string }) => {
          console.log(`[Local Cron]   - ${result.scheduleName}: ${result.status}${result.message ? ` (${result.message})` : ""}`);
        });
      }
    } else {
      console.error(`[Local Cron] ${timestamp} - Error: ${data.error}`);
    }
  } catch (error) {
    console.error(`[Local Cron] ${timestamp} - Failed to trigger: ${error instanceof Error ? error.message : "Unknown error"}`);
  }

  console.log("");
});

process.stdin.resume();
