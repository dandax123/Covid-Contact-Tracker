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

export const update_user_warn_status: QueryType = {
  operation: {
    name: "update_Contact",
    args: {
      where: {
        _or: [
          {
            primary_user: { _eq: "$p_user" },
            secondary_user: { _eq: "$s_user" },
          },
          {
            primary_user: { _eq: "$s_user" },
            secondary_user: { _eq: "$p_user" },
          },
        ],
      },
      _set: {
        warn_status: true,
      },
    },
    fields: [
      {
        returning: {
          fields: ["contact_id"],
        },
      },
    ],
  },
};

export const update_user_covid_status: QueryType = {
  operation: {
    name: "update_User_by_pk",
    args: {
      pk_columns: {
        user_id: "$user_id",
      },
      _set: {
        covid_status: false,
      },
    },
    fields: ["user_id"],
  },
};

export const update_contact_warn_neg_status: QueryType = {
  operation: {
    name: "update_Contact_by_pk",
    args: {
      pk_columns: {
        contact_id: "$contact_id",
      },
      _set: {
        warn_status: false,
      },
    },
    fields: ["contact_id"],
  },
};
export const update_user_positive_covid_status: QueryType = {
  operation: {
    name: "update_User_by_pk",
    args: {
      pk_columns: {
        user_id: "$user_id",
      },
      _set: {
        covid_status: true,
      },
    },
    fields: ["user_id"],
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
      "contact_id",
      {
        Secondary_User_Contact: {
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
        Primary_User_Contact: {
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
