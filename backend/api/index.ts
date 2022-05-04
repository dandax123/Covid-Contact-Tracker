import * as http from "http";
import config from "./config";
import logger from "./config/logger";
import app from "./app";
import { check_positive_query } from "./grapqhl";

const port = config.PORT || 7000;

const server = http.createServer(app);

server.listen(port, async () => {
  await check_positive_query("77296183-f21e-4ad3-b9ae-540b8901507f");
  logger.info(`Server running on http://localhost:${port}`);
});
