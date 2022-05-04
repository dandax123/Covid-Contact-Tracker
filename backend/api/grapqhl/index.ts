import gotQl from "gotql";
import { check_user_covid_status } from "./queries";
export const check_positive_query = async (user: string): Promise<boolean> => {
  try {
    const data = {
      user: {
        type: "uuid",
        value: user,
      },
    };
    const y: { data: { User_aggregate: { aggregate: { count: number } } } } =
      await gotQl.query("http://localhost:8080/v1/graphql", {
        ...check_user_covid_status,
        variables: { ...data },
      });
    return Boolean(y.data.User_aggregate.aggregate.count);
  } catch (err) {
    console.error(err);
    return false;
  }
};
