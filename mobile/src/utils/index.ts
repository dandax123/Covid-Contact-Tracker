import {Platform, PermissionsAndroid, Alert} from 'react-native';
import BLEAdvertiser from 'react-native-ble-advertiser';
import SystemSetting from 'react-native-system-setting';

export const requestPermission = async (
  bluetooth = false,
  location = false,
): Promise<{
  location: boolean;
  bluetooth: boolean;
}> => {
  if (location && bluetooth) {
    return {location, bluetooth};
  }
  try {
    let result = {
      location,
      bluetooth,
    };
    // await SystemSetting.isBluetoothEnabled().then((enable: boolean) => {
    //   result.bluetooth = enable;
    // });
    // await SystemSetting.isLocationEnabled().then((enable: boolean) => {
    //   result.location = enable;
    // });
    if (!result.bluetooth) {
      await Alert.alert(
        'Covid Tracker app',
        'This app requires Bluetooth to be enabled to scan, broadcast and find other devices. Would you like to enable Bluetooth?',
        [
          {
            text: 'Yes',
            onPress: async () => {
              await BLEAdvertiser.enableAdapter();
              result.bluetooth = true;
              if (!location) {
                requestPermission(true, false);
              }
            },
          },
          {
            text: 'No',
            onPress: () => {
              result.bluetooth = false;
            },
            style: 'cancel',
          },
        ],
      );
    }
    if (result.bluetooth && !result.location) {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Covid Tracker App',
            message: 'Covid Tracker App access to your location ',
            buttonPositive: 'Ok',
          },
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          await SystemSetting.switchLocation();
          // await SystemSetting.isLocationEnabled().then((enable: boolean) => {
          //   result.location = enable;
          // });
          // result.location = true;

          console.log('[Permissions]', 'Location Permission granted');
        } else {
          result.location = false;
          console.log('[Permissions]', 'Location Permission denied');
        }
      }
    }

    return result;
  } catch (err) {
    throw new Error(err);
  }
};
