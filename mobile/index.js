/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import BackgroundFetch from 'react-native-background-fetch';
import {HeadlessTask} from './src/pages/headless';

BackgroundFetch.registerHeadlessTask(HeadlessTask);
AppRegistry.registerComponent(appName, () => App);
