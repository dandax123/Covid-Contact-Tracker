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

export const get_contacts_from_start_date: QueryType = {
  operation: {
    name: "Contact",
    args: {
      where: {
        _or: [
          { primary_user: { _eq: "$user_id" } },
          { secondary_user: { _eq: "$user_id" } },
        ],
        contact_time: { _gt: "$start_date" },
      },
    },
    fields: [
      {
        userBySecondaryUser: {
          fields: [
            "user_id",
            {
              Devices: {
                fields: ["device_id"],
              },
            },
          ],
        },
      },
      {
        User: {
          fields: [
            "user_id",
            {
              Devices: {
                fields: ["device_id"],
              },
            },
          ],
        },
      },
    ],
  },
};
