// import {HttpLink} from 'apollo-link-http';

const PROD_HASURA_URL: string =
  'https://cv-tracker-graphql.herokuapp.com/v1/graphql';
// const DEV_HASURA_URL: string = 'http://localhost:8080';
// const HASURA_ADMIN_SECRET = 'cv-tracker';

import {ApolloClient, InMemoryCache, HttpLink} from '@apollo/client';
// import {HttpLink} from 'apollo-link-http';

// Initialize Apollo Client

const newApolloclient = () => {
  const link = new HttpLink({
    uri: PROD_HASURA_URL,
    // headers: {
    //   'x-hasura-admin-secret': HASURA_ADMIN_SECRET,
    //   // 'content-type': 'application/json',
    // },
  });

  // const cache = new InMemoryCache();
  // const client = new ApolloClient({
  //   link,
  //   cache,
  // });
  const client = new ApolloClient({
    link,
    cache: new InMemoryCache(),
  });
  return client;
};

export default newApolloclient;
