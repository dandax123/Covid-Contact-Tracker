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
// import {check_user_exist} from './src/graphql/queries';
import useDevice from './src/store/useDevices';
import Test from './src/pages/test';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
// import useSetup from './src/store/useSetup';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useState} from 'react';
import useSetup from './src/store/useSetup';

const new_client = newApolloclient();
// const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  const {uuid} = useDevice();
  const [ready_to_serve, setReady] = useState(false);
  const {ready_to_serve: main_ready_to_serve} = useSetup();
  // console.log(uuid);
  useEffect(() => {
    async function init() {
      const y = await AsyncStorage.getItem('setup');
      setIsLoading(false);
      // console.log(y);
      setReady(JSON?.parse(y!)?.state?.ready_to_serve);

      SplashScreen.hide();
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
          {(ready_to_serve || main_ready_to_serve) && !isLoading ? (
            <NavigationContainer theme={DarkTheme}>
              <Tab.Navigator
                screenOptions={({route}) => ({
                  tabBarShowLabel: true,
                  headerStyle: {
                    backgroundColor: theme.darkColors?.background,
                  },
                  tabBarIcon: ({color}) => {
                    const icons: {[index: string]: string} = {
                      Exposures: 'bell',
                      Notify: 'flag',
                    };

                    return (
                      <MaterialCommunityIcons
                        name={icons[route.name]}
                        color={color}
                        size={30}
                      />
                    );
                  },
                })}>
                <Tab.Screen name="Exposures" component={Home} />
                <Tab.Screen name="Notify" component={Test} />
              </Tab.Navigator>
            </NavigationContainer>
          ) : (
            <RegisterComponent />
          )}
        </ThemeProvider>
      </Entry>
    </ApolloProvider>
  );
};

export default App;
