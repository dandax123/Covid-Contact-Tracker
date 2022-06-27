import axios from "axios";

const serverKey = `${process.env.SERVER_KEY}`;

export const setScheduledTimerEvent = async (
  payload: { [index: string]: any },
  schedule_at: string,
  response_url: string
) => {
  try {
    await axios.post(`https://cv-tracker-graphql.herokuapp.com/v1/metadata`, {
      type: "create_scheduled_event",
      args: {
        webhook: `https://cv-tracker-backend.herokuapp.com/v1/${response_url}`,
        schedule_at,
        payload,
      },
    });
  } catch (err) {
    console.log("Error");
    console.error(err);
  }
};

export const sendFcmNotification = async (
  devices: string[],
  message: string
) => {
  try {
    if (!devices.length) {
      return;
    }
    await axios.post(
      "https://fcm.googleapis.com/fcm/send",
      {
        registration_ids: devices,
        notification: {
          body: message,
          title: "Covid Tracker Notifications",
          sound: "default",
        },
        data: {
          priority: "high",
        },
      },
      {
        headers: {
          Authorization: `key=${serverKey}`,
        },
      }
    );
  } catch (err) {
    console.error(err);
  }
};
