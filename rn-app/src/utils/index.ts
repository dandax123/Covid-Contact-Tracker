import {Platform, PermissionsAndroid, Alert} from 'react-native';
import BLEAdvertiser from 'react-native-ble-advertiser';

export const requestLocationPermission = async (): Promise<{
  location: boolean;
  bluetooth: boolean;
}> => {
  try {
    let result = {
      location: false,
      bluetooth: false,
    };
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'BLE Avertiser Example App',
          message: 'Example App access to your location ',
          buttonPositive: 'Ok',
        },
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        result.location = true;
        console.log('[Permissions]', 'Location Permission granted');
      } else {
        result.location = false;
        console.log('[Permissions]', 'Location Permission denied');
      }
    }

    const blueoothActive = await BLEAdvertiser.getAdapterState()
      .then(a_result => {
        console.log('[Bluetooth]', 'Bluetooth Status', a_result);
        return a_result === 'STATE_ON';
      })
      .catch(_e => {
        console.error('[Bluetooth]', 'Bluetooth Not Enabled');
        return false;
      });

    if (!blueoothActive) {
      await Alert.alert(
        'Example requires bluetooth to be enabled',
        'Would you like to enable Bluetooth?',
        [
          {
            text: 'Yes',
            onPress: () => {
              BLEAdvertiser.enableAdapter();
              result.bluetooth = true;
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
    } else {
      result.bluetooth = true;
    }
    return result;
  } catch (err) {
    throw new Error(err);
  }
};
