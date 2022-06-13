export const ApiCall = async <T>(
  operationName: string,
  query: string,
  data: {[index: string]: any},
): Promise<T> => {
  try {
    const endpoint = 'https://cv-tracker-graphql.herokuapp.com/v1/graphql';
    const headers = {
      'content-type': 'application/json',
    };
    const graphqlQuery = {
      operationName,
      query,
      variables: data,
    };

    const options = {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(graphqlQuery),
    };

    const response = await fetch(endpoint, options);
    const y: T = await response.json();
    console.log(y);
    // console.log(y?.errors);
    return y;
  } catch (err) {
    console.error(err);
    throw new Error(err);
    // return false;
  }
};
