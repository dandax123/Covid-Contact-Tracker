import * as http from "http";
import config from "./config";
import logger from "./config/logger";
import app from "./app";

const port = config.PORT || 7000;

const server = http.createServer(app);

server.listen(port, async () => {
  logger.info(`Server running on http://localhost:${port}`);
});
