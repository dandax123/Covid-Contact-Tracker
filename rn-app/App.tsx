import React from 'react';
import Entry from './src/app';
import {ApolloProvider} from '@apollo/client';

import {NavigationContainer} from '@react-navigation/native';
import newApolloclient from './src/utils/apollo';
import {createStackNavigator} from '@react-navigation/stack';

const new_client = newApolloclient();
const Stack = createStackNavigator();
const App = () => {
  return (
    <ApolloProvider client={new_client}>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="Home" component={Entry} />
        </Stack.Navigator>
      </NavigationContainer>
    </ApolloProvider>
  );
};

export default App;
