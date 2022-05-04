export const check_user_covid_status = {
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
