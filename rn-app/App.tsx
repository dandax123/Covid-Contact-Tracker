import React from 'react';
import Entry from './src/app';
import {ApolloProvider} from '@apollo/client';

import {NavigationContainer} from '@react-navigation/native';
import newApolloclient from './src/utils/apollo';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
// import {createStackNavigator} from '@react-navigation/stack';
import Home from './src/pages/home';

const new_client = newApolloclient();
// const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
const App = () => {
  return (
    <ApolloProvider client={new_client}>
      <NavigationContainer>
        <Tab.Navigator>
          <Tab.Screen name="Home" component={Entry} />
          <Tab.Screen name="Test" component={Home} />
        </Tab.Navigator>
      </NavigationContainer>
    </ApolloProvider>
  );
};

export default App;
