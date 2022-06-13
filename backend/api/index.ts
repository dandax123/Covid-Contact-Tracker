import * as http from "http";
import config from "./config";
import logger from "./config/logger";
import app from "./app";
import { check_positive_query } from "./grapqhl";
import { sendFcmNotification } from "./utils";

const port = config.PORT || 7000;

const server = http.createServer(app);

server.listen(port, async () => {
  await sendFcmNotification(
    [
      "e2VyiOEJSzKS_TRUDWKyCI:APA91bEqIkuc9007P5L9AxuQa0UtWrcey13VxiFywhpho0RdHhfuOQQjVKu6zvH-IKMLYtiwdPi_04XRBp8hrvvcUw8qqnajmZ4uFMTIv02wfPgY6tHzqEvXWjppRDUfRHdMVDvMAkAc",
    ],

    "test"
  );
  logger.info(`Server running on http://localhost:${port}`);
});
