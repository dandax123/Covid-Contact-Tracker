import axios from "axios";

const serverKey =
  "AAAAcSJccXE:APA91bGBn_Du4lVdqFt_MJX7lYY2To16OJ2jrb99SHUbXd56WZS9id5XjNg07YfOXKksY9_SU0nbI1DkbY2V2T3pHb88OhTj9-GpuCGBpIRFukU_2Vr5OzQPPtyDFeVKJQL0VmmJqgAV";

export const sendFcmNotification = async (
  device_id: string,
  message: string
) => {
  try {
    await axios.post(
      "https://fcm.googleapis.com/fcm/send",
      {
        registration_ids: [device_id],
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
