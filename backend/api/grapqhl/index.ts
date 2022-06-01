import gotQl from "gotql";
import { Contact_Users } from "../utils/types";
import {
  check_user_covid_status,
  get_contacts_from_start_date,
  get_user_devices,
  update_user_warn_status,
} from "./queries";
const GRAPHQL_URL = process.env.GRAPHQL_URL
  ? `${process.env.GRAPQH_URL}`
  : "https://cv-tracker-graphql.herokuapp.com/v1/graphql";
export const check_positive_query = async (user: string): Promise<boolean> => {
  try {
    const data = {
      user: {
        type: "uuid!",
        value: user,
      },
    };
    const y: { data: { User_aggregate: { aggregate: { count: number } } } } =
      await gotQl.query(GRAPHQL_URL, {
        ...check_user_covid_status,
        variables: { ...data },
      });
    return Boolean(y.data.User_aggregate.aggregate.count);
  } catch (err) {
    console.error(err);
    return false;
  }
};

export const get_user_device = async (user: string): Promise<string[]> => {
  try {
    const data = {
      user: {
        type: "uuid!",
        value: user,
      },
    };
    const y: {
      data: { Device: [{ device_id: string }] };
    } = await gotQl.query(GRAPHQL_URL, {
      ...get_user_devices,
      variables: { ...data },
    });
    return y.data.Device.map((x) => x.device_id);
  } catch (err) {
    console.error(err);
    return [];
  }
};

export const change_user_warn_status = async (user_id: string) => {
  try {
    const data = {
      user_id: {
        type: "uuid!",
        value: user_id,
      },
    };
    await gotQl.mutation(GRAPHQL_URL, {
      ...update_user_warn_status,
      variables: { ...data },
    });
  } catch (err) {
    console.error(err);
  }
};
export const get_user_contacts_by_date = async (
  user_id: string,
  start_date: string
): Promise<{ user_id: string[]; device_id: string[] }> => {
  try {
    const data = {
      user_id: {
        type: "uuid!",
        value: user_id,
      },
      start_date: {
        type: "timestamp",
        value: start_date,
      },
    };

    const res: Contact_Users = await gotQl.query(GRAPHQL_URL, {
      ...get_contacts_from_start_date,
      variables: {
        ...data,
      },
    });

    const device_ids = res.data.Contact.map((y) => [
      {
        user_id: y.Primary_User_Contact.user_id,
        device_id: y.Primary_User_Contact.Devices[0].device_id,
      },
      {
        user_id: y.Secondary_User_Contact.user_id,
        device_id: y.Secondary_User_Contact.Devices[0].device_id,
      },
    ])
      .flat()
      .filter((y) => y.user_id !== user_id)
      .reduce(
        (acc: { device_id: string[]; user_id: string[] }, curr) => {
          return {
            device_id: [...acc["device_id"], curr.device_id],
            user_id: [...acc["user_id"], curr.user_id],
          };
        },
        {
          device_id: [],
          user_id: [],
        }
      );
    return device_ids;
  } catch (err) {
    console.error(err);
    return { device_id: [], user_id: [] };
  }
};
