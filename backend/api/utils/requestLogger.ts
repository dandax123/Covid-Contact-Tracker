import logger from "../config/logger";
import { Request, Response, NextFunction } from "express";

const requestLogger = (
  request: Request,
  _: Response,
  next: NextFunction
): void => {
  logger.info("Method:", request.method);
  logger.info("Path:  ", request.url);
  request.method === "GET"
    ? logger.info("Query:  ", request.query)
    : logger.info("Body:  ", request.body);
  logger.info("---");
  next();
};

export default requestLogger;
