import gotQl from "gotql";
import { Contact_Users } from "../utils/types";
import {
  check_user_covid_status,
  get_contacts_from_start_date,
  get_user_devices,
} from "./queries";
const GRAPHL_URL = "http://graphql-engine:8080/v1/graphql";
export const check_positive_query = async (user: string): Promise<boolean> => {
  try {
    const data = {
      user: {
        type: "uuid",
        value: user,
      },
    };
    const y: { data: { User_aggregate: { aggregate: { count: number } } } } =
      await gotQl.query(GRAPHL_URL, {
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
        type: "uuid",
        value: user,
      },
    };
    const y: {
      data: { Device: [{ device_id: string }] };
    } = await gotQl.query(GRAPHL_URL, {
      ...get_user_devices,
      variables: { ...data },
    });
    return y.data.Device.map((x) => x.device_id);
  } catch (err) {
    console.error(err);
    return [];
  }
};

export const get_user_contacts_by_date = async (
  user_id: string,
  start_date: string
): Promise<string[]> => {
  try {
    const data = {
      user_id: {
        type: "uuid",
        value: user_id,
      },
      start_date: {
        type: "timestamptz",
        value: start_date,
      },
    };

    const res: Contact_Users = await gotQl.query(GRAPHL_URL, {
      ...get_contacts_from_start_date,
      variables: {
        ...data,
      },
    });

    const device_ids = res.data.Contact.map((y) => [
      {
        user_id: y.userBySecondaryUser.user_id,
        device_id: y.userBySecondaryUser.Devices[0].device_id,
      },
      {
        user_id: y.User.user_id,
        device_id: y.User.Devices[0].device_id,
      },
    ])
      .flat()
      .filter((y) => y.user_id !== user_id)
      .map((y) => y.device_id);
    return device_ids;
  } catch (err) {
    console.error(err);
    return [];
  }
};
