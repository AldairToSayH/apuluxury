import { createServer } from "node:http";

import { app } from "./app";
import { closeDatabaseConnection, testDatabaseConnection } from "./config/db";
import { env } from "./config/env";

async function bootstrap() {
  await testDatabaseConnection();

  const server = createServer(app);

  server.listen(env.PORT, () => {
    console.log(`APU LUXURY API running on http://localhost:${env.PORT}`);
  });

  const shutdown = async (signal: NodeJS.Signals) => {
    console.log(`${signal} received. Shutting down API server...`);

    server.close(async () => {
      await closeDatabaseConnection();
      process.exit(0);
    });
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

bootstrap().catch((error) => {
  const message = error instanceof Error ? error.message : "Unknown startup error";

  console.error(`Failed to start APU LUXURY API: ${message}`);
  process.exit(1);
});
