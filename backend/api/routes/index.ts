import express from "express";
const router = express.Router();
import type { Response, NextFunction, Request } from "express";

router.post("/new_contact", async (req: Request, res: Response) => {
  res.json({ success: true });
});

export default router;
