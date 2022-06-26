import express from "express";
const router = express.Router();
import type { Response, NextFunction, Request } from "express";
import { NewContact, NewCvTest } from "../utils/types";
import {
  change_contact_to_negwarn_status,
  change_users_warn_status,
  change_user_covid_status,
  check_positive_query,
  get_user_contacts_by_date,
  get_user_device,
} from "../grapqhl";
import logger from "../config/logger";
import { sendFcmNotification, setScheduledTimerEvent } from "../utils";
import moment, { now } from "moment";
import { forEachSeries } from "p-iteration";

router.post("/new_contact", async (req: Request, res: Response) => {
  try {
    const data: NewContact = req.body.event.data.new;
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
    await change_users_warn_status(data.primary_user, data.secondary_user);
    await setScheduledTimerEvent(
      {
        contact_id: data.contact_id,
      },
      moment(data.contact_time).add(3, "d").toISOString(),
      "switch_warn_case"
    );

    return res.json({ success: true });
  } catch (err) {
    console.log("Error!!!");
    logger.error(err);
    return res.status(400).json({ success: false });
  }
});
router.get("/ping", async (req: Request, res: Response) => {
  res.json({ success: true, message: "pong" });
});
router.post("/new_cvtest", async (req: Request, res: Response) => {
  try {
    const data: NewCvTest = req.body.event.data.new;
    if (!data.test_status) {
      return res.json({ success: true });
    }
    const last_14_days = moment(data.test_time).subtract(14, "d").toISOString();
    const { device_id: devices, user_id: users } =
      await get_user_contacts_by_date(data.user_id, last_14_days);

    await change_user_covid_status(data.user_id, true);
    await sendFcmNotification(
      devices,
      "In the last three days you have made contact with a Covid Positive Person, we suggest you take a covid test !!"
    );

    await forEachSeries(users, async (y) => {
      const contact_id = await change_users_warn_status(data.user_id, y);
      await setScheduledTimerEvent(
        {
          contact_id,
        },
        moment(data.test_time).add(3, "d").toISOString(),
        "switch_warn_case"
      );
    });
    await setScheduledTimerEvent(
      {
        user_id: data.user_id,
      },
      moment(data.test_time).add(7, "d").toISOString(),
      "switch_test_case"
    );
    return res.json({ success: true });
  } catch (err) {
    logger.error(err);

    return res.status(400).json({ success: false });
  }
});

router.post("/switch_test_case", async (req: Request, res: Response) => {
  try {
    const user_id = req.body.payload.user_id;
    await change_user_covid_status(user_id, false);
    return res.json({ success: true });
  } catch (err) {
    logger.error(err);
    return res.status(400).json({ success: false });
  }
});
router.post("/switch_warn_case", async (req: Request, res: Response) => {
  try {
    const contact_id = req.body.payload.contact_id;
    await change_contact_to_negwarn_status(contact_id);
    return res.json({ success: true });
  } catch (err) {
    logger.error(err);
    return res.status(400).json({ success: false });
  }
});
export default router;
