import React, {useEffect} from 'react';
import Entry from './src/app';
import {ApolloProvider} from '@apollo/client';

import {DarkTheme} from '@react-navigation/native';

import {NavigationContainer} from '@react-navigation/native';
import newApolloclient from './src/utils/apollo';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import SplashScreen from 'react-native-splash-screen';

// import {createStackNavigator} from '@react-navigation/stack';
import Home from './src/pages/home';
import {createTheme, ThemeProvider} from '@rneui/themed';
import RegisterComponent from './src/pages/register';
import {check_user_exist} from './src/graphql/queries';
import useDevice from './src/store/useDevices';
import Test from './src/pages/test';

const new_client = newApolloclient();
// const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
const App = () => {
  const {uuid, ready_to_serve, setup} = useDevice();

  useEffect(() => {
    async function init() {
      if (uuid !== '') {
        // SplashScreen.show();
        const doesExist = await check_user_exist(uuid);
        setup('ready_to_serve', doesExist);
        SplashScreen.hide();
      }
      // if (uuid !== '' && doesExist ) {
      // }
    }
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uuid]);
  const theme = createTheme({
    Button: {
      raised: true,
    },
  });
  return (
    <ApolloProvider client={new_client}>
      <Entry>
        <ThemeProvider theme={theme}>
          {!ready_to_serve ? (
            <RegisterComponent />
          ) : (
            <NavigationContainer theme={DarkTheme}>
              <Tab.Navigator>
                <Tab.Screen name="Home" component={Home} />
                <Tab.Screen name="Test" component={Test} />
                <Tab.Screen name="Settings" component={Home} />
              </Tab.Navigator>
            </NavigationContainer>
          )}
        </ThemeProvider>
      </Entry>
    </ApolloProvider>
  );
};

export default App;
