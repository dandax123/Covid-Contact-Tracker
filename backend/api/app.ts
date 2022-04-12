import express from "express";
import requestLogger from "./utils/requestLogger";
import errorHandler from "./utils/errorHandler";
import indexRouter from "./routes";

const app = express();
app.use(express.json());

app.use(requestLogger);

app.use("/v1", indexRouter);
// Routes  here <---

app.use(errorHandler);

app.get("/", (req, res) => {
  res.json({ msg: "Wer'e up !!" });
});
// Unknown endpoint handler
app.use((_, res) => {
  res.status(400).json({ error: "bad request" });
});

export default app;
