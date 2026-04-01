import app from "./app";
import { env } from "./config/env";
import logger from "./utils/logger";

const PORT = env.PORT;

app.listen(PORT, "0.0.0.0", () => {
  logger.info(`🚀 Server running on 0.0.0.0:${PORT}`);
  logger.info(`📍 Environment: ${env.NODE_ENV}`);
  logger.info(`🔗 Health check: http://localhost:${PORT}/api/v1/health`);
});
