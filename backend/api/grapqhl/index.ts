import gotQl from "gotql";
import { check_user_covid_status, get_user_devices } from "./queries";
const GRAPHL_URL = "";
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
