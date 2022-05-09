import React, {useEffect} from 'react';
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

import {NativeEventEmitter, NativeModules} from 'react-native';

import BLEAdvertiser from 'react-native-ble-advertiser';
import {getAppKey} from './utils/key_storage';

import BluetoothStateManager from 'react-native-bluetooth-state-manager';

import {requestLocationPermission} from './utils';
import Home from './pages/home';
import useBluetoothState from './store/useBluetoothState';
import useDevice from './store/useDevices';
import {useMutation, useQuery} from '@apollo/client';
import {CHECK_USER_EXIST, CREATE_NEW_USER_WITH_DEVICE} from './graphql/queries';
import {Device} from './utils/types';

// Uses the Apple code to pick up iPhones
const APPLE_ID = 0x241c;
const MANUF_DATA = [1, 0];
const c15_MINS = 1000 * 60 * 15;

BLEAdvertiser.setCompanyId(APPLE_ID);

const Entry = () => {
  const [createNewUser] = useMutation(CREATE_NEW_USER_WITH_DEVICE);

  const {changeBluetoothState, bluetooth_active} = useBluetoothState();
  const {setup: deviceSetup, uuid, devices} = useDevice();
  const {data: user_exist, loading} = useQuery(CHECK_USER_EXIST, {
    variables: {
      user_id: uuid,
    },
  });

  useEffect(() => {
    const setup = async () => {
      const app_key = await getAppKey();
      deviceSetup('uuid', app_key);

      if (!bluetooth_active) {
        const result = await requestLocationPermission();
        if (result.bluetooth && result.location) {
          changeBluetoothState(true);
        }
      }
    };
    setup();

    () => {
      if (false) {
        stop();
      }
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bluetooth_active, uuid]);
  useEffect(() => {
    // Request permissions on iOS, refresh token on Android
    Notifications.registerRemoteNotifications();

    Notifications.events().registerRemoteNotificationsRegistered(
      (event: Registered) => {
        // TODO: Send the token to my server so it could send back push notifications...
        console.log('Device Token Received', event.deviceToken);
        console.log(uuid, user_exist, loading);
        if (
          uuid !== '' &&
          !user_exist?.User_aggregate?.aggregate?.count &&
          !loading
        ) {
          createNewUser({
            variables: {
              user_id: uuid,
              device_id: event.deviceToken,
            },
          });
        }
        deviceSetup('token_id', event.deviceToken);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uuid]);

  useEffect(() => {
    BluetoothStateManager.onStateChange(y => {
      switch (y) {
        case 'PoweredOn':
          changeBluetoothState(true);
          break;
        default:
          changeBluetoothState(false);
          break;
      }
    }, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const start = () => {
    console.log(uuid, 'Registering Listener');
    const eventEmitter = new NativeEventEmitter(NativeModules.BLEAdvertiser);

    eventEmitter.addListener('onDeviceFound', event => {
      console.log('onDeviceFound', event);
      if (event.serviceUuids) {
        for (let i = 0; i < event.serviceUuids.length; i++) {
          if (event.serviceUuids[i] && event.serviceUuids[i].endsWith('00')) {
            handle_device_discovery({
              uuid: event.serviceUuids[i],
              contact_time: new Date(),
            });
          }
        }
      }
    });

    console.log(uuid, 'Starting Advertising');
    if (uuid === null) {
      // const app_key = await getAppKey();
      // setState({...state, uuid: app_key});
    }
    BLEAdvertiser.broadcast(uuid, MANUF_DATA, {
      advertiseMode: 2,
      txPowerLevel: 2,
      connectable: false,
      includeDeviceName: false,
      includeTxPowerLevel: false,
    })
      .then(sucess => console.log(uuid, 'Adv Successful', sucess))
      .catch(error => console.log(uuid, 'Adv Error', error));

    console.log(uuid, 'Starting Scanner');
    BLEAdvertiser.scan(MANUF_DATA, {
      scanMode: 2,
    })
      .then(sucess => console.log(uuid, 'Scan Successful', sucess))
      .catch(error => console.log(uuid, 'Scan Error', error));
  };

  const stop = () => {
    console.log(uuid, 'Removing Listener');
    // onDeviceFound.remove();
    // delete onDeviceFound;

    console.log(uuid, 'Stopping Broadcast');
    BLEAdvertiser.stopBroadcast()
      .then(sucess => console.log(uuid, 'Stop Broadcast Successful', sucess))
      .catch(error => console.log(uuid, 'Stop Broadcast Error', error));

    console.log(uuid, 'Stopping Scanning');
    BLEAdvertiser.stopScan()
      .then(sucess => console.log(uuid, 'Stop Scan Successful', sucess))
      .catch(error => console.log(uuid, 'Stop Scan Error', error));
  };

  const short = (str: string) => {
    return (
      str.substring(0, 4) +
      ' ... ' +
      str.substring(str.length - 4, str.length)
    ).toUpperCase();
  };

  const handle_device_discovery = (device: Device) => {
    //new_contact
    const is_old_contact = devices.find(x => x.uuid === device.uuid);
    if (is_old_contact) {
      //seen in the last 15 minutes, should discard
      const new_time = new Date();
      if (
        is_old_contact.contact_time.getTime() - new_time.getTime() <
        c15_MINS
      ) {
        //discard
      }
    } else {
    }
  };

  return (
    <SafeAreaView>
      <View style={styles.body}>
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>BLE Advertiser Demo</Text>
          <Text style={styles.sectionDescription}>
            Broadcasting: <Text style={styles.highlight}>{uuid}</Text>
          </Text>
        </View>

        <View style={styles.sectionContainer}>
          {true ? (
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
            data={devices}
            renderItem={({item}) => (
              <Text style={styles.itemPastConnections}>{short(item.uuid)}</Text>
            )}
            keyExtractor={item => item.uuid}
          />
        </View>

        <View>
          <Home />
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
