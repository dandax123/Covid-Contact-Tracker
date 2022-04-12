import logger from "../config/logger";
import { Request, Response, NextFunction } from "express";

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
const requestLogger = (
  error: Error,
  _: Request,
  response: Response,
  next: NextFunction
): void | Response => {
  logger.info(error);
  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" });
  }
  if (error.name === "ValidationError") {
    return response.status(400).json({ error: error.message });
  }
  if (error.name === "JsonWebTokenError") {
    return response.status(401).json({ error: "invalid token" });
  }

  return response.status(500).json({ error: "Server Error", e: error.message });
};

class GeneralError extends Error {
  constructor(message: any, stack?: string) {
    super();
    this.message = JSON.stringify(message);
    this.stack = stack ?? "";
  }
}

export default requestLogger;
