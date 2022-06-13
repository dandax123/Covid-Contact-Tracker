import BackgroundFetch from 'react-native-background-fetch';
import {Notifications} from 'react-native-notifications';

export const HeadlessTask = async event => {
  if (event.timeout) {
    console.log('[BackgroundFetch] 💀 HeadlessTask TIMEOUT: ', event.taskId);
    BackgroundFetch.finish(event.taskId);
    return;
  }

  Notifications.postLocalNotification({
    title: 'Local notification',
    body: 'This notification was generated by the app!',
    extra: 'data',
  });

  console.log(event);
};