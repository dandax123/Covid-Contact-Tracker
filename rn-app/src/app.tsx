import React, {useEffect, useState} from 'react';
import {
  Notification,
  Notifications,
  Registered,
  RegistrationError,
} from 'react-native-notifications';
import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  FlatList,
} from 'react-native';

import {Alert, Platform} from 'react-native';
import {NativeEventEmitter, NativeModules} from 'react-native';

import update from 'immutability-helper';
import BLEAdvertiser from 'react-native-ble-advertiser';
import {PermissionsAndroid} from 'react-native';
import {getAppKey} from './utils/key_storage';

// Uses the Apple code to pick up iPhones
const APPLE_ID = 0x241c;
const MANUF_DATA = [1, 0];

BLEAdvertiser.setCompanyId(APPLE_ID);
type Device = {
  uuid: string;
  name: string;
  mac: string;
  rssi: string;
  start: Date;
  end: Date;
};
const requestLocationPermission = async (): Promise<{
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

const Entry = () => {
  const [state, setState] = useState<{
    uuid: string;
    isLogging: boolean;
    devicesFound: Device[];
  }>({
    uuid: '',
    isLogging: false,
    devicesFound: [],
  });
  const [mobileSetup, setMobileSetup] = useState(false);

  useEffect(() => {
    const setup = async () => {
      if (!mobileSetup) {
        const result = await requestLocationPermission();
        if (result.bluetooth && result.location) {
          const app_key = await getAppKey();
          console.log(app_key);
          setState({
            ...state,
            uuid: app_key,
          });
          setMobileSetup(true);
        }
      }
    };
    setup();

    () => {
      if (state.isLogging) {
        stop();
      }
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mobileSetup]);
  useEffect(() => {
    // Request permissions on iOS, refresh token on Android
    Notifications.registerRemoteNotifications();

    Notifications.events().registerRemoteNotificationsRegistered(
      (event: Registered) => {
        // TODO: Send the token to my server so it could send back push notifications...
        console.log('Device Token Received', event.deviceToken);
      },
    );
    Notifications.events().registerRemoteNotificationsRegistrationFailed(
      (event: RegistrationError) => {
        console.error(event);
      },
    );

    Notifications.events().registerNotificationReceivedForeground(
      (notification: Notification, completion) => {
        console.log(
          `Notification received in foreground: ${notification.title} : ${notification.body}`,
        );
        completion({alert: false, sound: false, badge: false});
      },
    );

    Notifications.events().registerNotificationOpened(
      (notification: Notification, completion) => {
        console.log(`Notification opened: ${notification.payload}`);
        completion();
      },
    );
  }, []);
  const addDevice = (
    _uuid: string,
    _name: string,
    _mac: string,
    _rssi: string,
    _date: Date,
  ) => {
    const index = state.devicesFound.findIndex(({uuid}) => uuid == _uuid);
    if (index < 0) {
      setState({
        ...state,
        devicesFound: [
          ...state.devicesFound,
          {
            uuid: _uuid,
            name: _name,
            mac: _mac,
            rssi: _rssi,
            start: _date,
            end: _date,
          },
        ],
      });
    } else {
      setState({
        ...state,
        devicesFound: update(state.devicesFound, {
          [index]: {
            end: {$set: _date},
            rssi: {$set: _rssi || state.devicesFound[index].rssi},
          },
        }),
      });
    }
  };

  const start = async () => {
    console.log(state.uuid, 'Registering Listener');
    const eventEmitter = new NativeEventEmitter(NativeModules.BLEAdvertiser);

    eventEmitter.addListener('onDeviceFound', event => {
      console.log('onDeviceFound', event);
      if (event.serviceUuids) {
        for (let i = 0; i < event.serviceUuids.length; i++) {
          if (event.serviceUuids[i] && event.serviceUuids[i].endsWith('00')) {
            addDevice(
              event.serviceUuids[i],
              event.deviceName,
              event.deviceAddress,
              event.rssi,
              new Date(),
            );
          }
        }
      }
    });

    console.log(state.uuid, 'Starting Advertising');
    if (state.uuid === null) {
      const app_key = await getAppKey();
      setState({...state, uuid: app_key});
    }
    BLEAdvertiser.broadcast(state.uuid, MANUF_DATA, {
      advertiseMode: 2,
      txPowerLevel: 2,
      connectable: false,
      includeDeviceName: false,
      includeTxPowerLevel: false,
    })
      .then(sucess => console.log(state.uuid, 'Adv Successful', sucess))
      .catch(error => console.log(state.uuid, 'Adv Error', error));

    console.log(state.uuid, 'Starting Scanner');
    BLEAdvertiser.scan(MANUF_DATA, {
      scanMode: 2,
    })
      .then(sucess => console.log(state.uuid, 'Scan Successful', sucess))
      .catch(error => console.log(state.uuid, 'Scan Error', error));

    setState({
      ...state,
      isLogging: true,
    });
  };

  const stop = () => {
    console.log(state.uuid, 'Removing Listener');
    // onDeviceFound.remove();
    // delete onDeviceFound;

    console.log(state.uuid, 'Stopping Broadcast');
    BLEAdvertiser.stopBroadcast()
      .then(sucess =>
        console.log(state.uuid, 'Stop Broadcast Successful', sucess),
      )
      .catch(error => console.log(state.uuid, 'Stop Broadcast Error', error));

    console.log(state.uuid, 'Stopping Scanning');
    BLEAdvertiser.stopScan()
      .then(sucess => console.log(state.uuid, 'Stop Scan Successful', sucess))
      .catch(error => console.log(state.uuid, 'Stop Scan Error', error));

    setState({...state, isLogging: false});
  };

  const short = (str: string) => {
    return (
      str.substring(0, 4) +
      ' ... ' +
      str.substring(str.length - 4, str.length)
    ).toUpperCase();
  };

  return (
    <SafeAreaView>
      <View style={styles.body}>
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>BLE Advertiser Demo</Text>
          <Text style={styles.sectionDescription}>
            Broadcasting: <Text style={styles.highlight}>{state.uuid}</Text>
          </Text>
        </View>

        <View style={styles.sectionContainer}>
          {state.isLogging ? (
            <TouchableOpacity
              onPress={() => stop()}
              style={styles.stopLoggingButtonTouchable}>
              <Text style={styles.stopLoggingButtonText}>Stop</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => start()}
              style={styles.startLoggingButtonTouchable}>
              <Text style={styles.startLoggingButtonText}>Start</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.sectionContainerFlex}>
          <Text style={styles.sectionTitle}>Devices Around</Text>
          <FlatList
            data={state.devicesFound}
            renderItem={({item}) => (
              <Text style={styles.itemPastConnections}>
                {short(item.uuid)} {item.mac} {item.rssi}
              </Text>
            )}
            keyExtractor={item => item.uuid}
          />
        </View>

        <View style={styles.sectionContainer}>
          <TouchableOpacity
            onPress={() => setState({...state, devicesFound: []})}
            style={styles.startLoggingButtonTouchable}>
            <Text style={styles.startLoggingButtonText}>Clear Devices</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  body: {
    height: '100%',
  },
  sectionContainerFlex: {
    flex: 1,
    marginTop: 12,
    marginBottom: 12,
    paddingHorizontal: 24,
  },
  sectionContainer: {
    flex: 0,
    marginTop: 12,
    marginBottom: 12,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    marginBottom: 8,
    fontWeight: '600',
    textAlign: 'center',
  },
  sectionDescription: {
    fontSize: 18,
    fontWeight: '400',
    textAlign: 'center',
  },
  highlight: {
    fontWeight: '700',
  },
  startLoggingButtonTouchable: {
    borderRadius: 12,
    backgroundColor: '#665eff',
    height: 52,
    alignSelf: 'center',
    width: 300,
    justifyContent: 'center',
  },
  startLoggingButtonText: {
    fontSize: 14,
    lineHeight: 19,
    letterSpacing: 0,
    textAlign: 'center',
    color: '#ffffff',
  },
  stopLoggingButtonTouchable: {
    borderRadius: 12,
    backgroundColor: '#fd4a4a',
    height: 52,
    alignSelf: 'center',
    width: 300,
    justifyContent: 'center',
  },
  stopLoggingButtonText: {
    fontSize: 14,
    lineHeight: 19,
    letterSpacing: 0,
    textAlign: 'center',
    color: '#ffffff',
  },
  listPastConnections: {
    width: '80%',
    height: 200,
  },
  itemPastConnections: {
    padding: 3,
    fontSize: 18,
    fontWeight: '400',
  },
});

export default Entry;
