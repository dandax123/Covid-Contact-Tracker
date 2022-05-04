import express from "express";
const router = express.Router();
import type { Response, NextFunction, Request } from "express";
import { NewContact } from "../utils/types";
import { check_positive_query } from "../grapqhl";

router.post("/new_contact", async (req: Request, res: Response) => {
  try {
    const data: NewContact = req.body.data.new;
    const isPrimaryPositive = await check_positive_query(data.primary_user);
    const isSecondaryPositive = await check_positive_query(data.secondary_user);
    const user_to_warn =
      isPrimaryPositive && !isSecondaryPositive
        ? data.secondary_user
        : isSecondaryPositive && !isPrimaryPositive
        ? data.primary_user
        : null;
    if (user_to_warn === null) {
      return res.json({ success: true });
    }
  } catch (err) {
    return res.status(400).json({ success: false });
  }
});

export default router;
