import {Platform, PermissionsAndroid, Alert} from 'react-native';
import BLEAdvertiser from 'react-native-ble-advertiser';
import SystemSetting from 'react-native-system-setting';
import {Exposure} from './types';
import moment from 'moment';

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

export const transformExposureData = (
  user_id: string,
  data: {
    Contact: [
      {
        contact_id: string;
        contact_time: string;
        Primary_User_Contact: {
          user_id: string;
          first_name: string;
          last_name: string;
        };
        Secondary_User_Contact: {
          user_id: string;
          first_name: string;
          last_name: string;
        };
      },
    ];
  },
): Array<Exposure> => {
  const contacts = data.Contact;
  console.log(contacts[0].Primary_User_Contact);
  const res: Exposure[] = contacts
    .map(y => [
      {
        user_id: y.Primary_User_Contact.user_id,
        contact_id: y.contact_id,
        contact_time: y.contact_time,
        contact_info: y.Primary_User_Contact,
      },
      {
        user_id: y.Secondary_User_Contact.user_id,
        contact_id: y.contact_id,
        contact_time: y.contact_time,
        contact_info: y.Secondary_User_Contact,
      },
    ])
    .flat()
    .filter(x => x.user_id !== user_id)
    .map(y => ({
      contact_id: y.contact_id,
      contact_time: moment.utc(y.contact_time).fromNow(),
      first_name: y.contact_info.first_name,
      last_name: y.contact_info.last_name,
    }));

  return res;
};
