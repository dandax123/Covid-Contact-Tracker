import { QueryType } from "gotql/dist/types/QueryType";

export const check_user_covid_status: QueryType = {
  operation: {
    name: "User_aggregate",
    args: {
      where: {
        user_id: {
          _eq: "$user",
        },
        covid_status: {
          _eq: true,
        },
      },
    },
    fields: [
      {
        aggregate: {
          fields: ["count"],
        },
      },
    ],
  },
};

// Device(where: {user_id: ""}) {
//     device_id,
//     notification_status
//   }
export const get_user_devices: QueryType = {
  operation: {
    name: "Device",
    args: {
      where: {
        user_id: {
          _eq: "$user",
        },
      },
    },
    fields: ["device_id"],
  },
};
