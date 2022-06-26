import axios from "axios";

const serverKey = process.env.SERVER_KEY;

// "AAAAcSJccXE:APA91bGBn_Du4lVdqFt_MJX7lYY2To16OJ2jrb99SHUbXd56WZS9id5XjNg07YfOXKksY9_SU0nbI1DkbY2V2T3pHb88OhTj9-GpuCGBpIRFukU_2Vr5OzQPPtyDFeVKJQL0VmmJqgAV"
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
