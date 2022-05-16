import express from "express";
const router = express.Router();
import type { Response, NextFunction, Request } from "express";
import { NewContact, NewCvTest } from "../utils/types";
import {
  check_positive_query,
  get_user_contacts_by_date,
  get_user_device,
} from "../grapqhl";
import { sendFcmNotification } from "../utils";
import moment from "moment";

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
    const devices = await get_user_device(user_to_warn);
    await sendFcmNotification(
      devices,
      "You are in contact with a Covid Positive Person, we suggest you take a covid test !!"
    );
    return res.json({ success: true });
  } catch (err) {
    return res.status(400).json({ success: false });
  }
});

router.post("/new_cvtest", async (req: Request, res: Response) => {
  try {
    const data: NewCvTest = req.body.data.new;
    if (!data.test_status) {
      return res.json({ success: true });
    }
    const last_3_days = moment(data.test_time).subtract(3, "d").toISOString();
    const devices = await get_user_contacts_by_date(data.user_id, last_3_days);
    await sendFcmNotification(
      devices,
      "In the last three days you have made contact with a Covid Positive Person, we suggest you take a covid test !!"
    );
    return res.json({ success: true });
  } catch (err) {
    return res.status(400).json({ success: false });
  }
});

export default router;
