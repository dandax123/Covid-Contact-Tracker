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

import {NativeEventEmitter} from 'react-native';

import SystemSetting from 'react-native-system-setting';
import BLEAdvertiser from 'react-native-ble-advertiser';
import {getAppKey} from './utils/key_storage';

import {requestLocationPermission} from './utils';
import Home from './pages/home';
import useBluetoothState from './store/useBluetoothState';
import useDevice from './store/useDevices';
import {useMutation, useQuery} from '@apollo/client';
import {
  ADD_NEW_CONTACT,
  check_contact_made,
  CHECK_USER_EXIST,
  CREATE_NEW_USER_WITH_DEVICE,
  UPDATE_LAST_SEEN,
} from './graphql/queries';
import {Device} from './utils/types';
import {forEachSeries} from 'p-iteration';

// Uses the Apple code to pick up iPhones
const APPLE_ID = 0x241c;
const MANUF_DATA = [1, 0];
const c15_MINS = 1000 * 60 * 10;

BLEAdvertiser.setCompanyId(APPLE_ID);

const Entry = () => {
  const [createNewUser] = useMutation(CREATE_NEW_USER_WITH_DEVICE);
  const [createNewContact] = useMutation(ADD_NEW_CONTACT);
  const [updateLastSeen] = useMutation(UPDATE_LAST_SEEN);
  const {changeDeviceState, bluetooth_active, location_active} =
    useBluetoothState();

  const {setup: deviceSetup, uuid, devices, update_device} = useDevice();
  const [state, setState] = useState({logging: false});
  const {data: user_exist, loading} = useQuery(CHECK_USER_EXIST, {
    variables: {
      user_id: uuid,
    },
  });
  const eventEmitter = new NativeEventEmitter();
  useEffect(() => {
    const setup = async () => {
      const app_key = await getAppKey();
      deviceSetup('uuid', app_key);

      if (!bluetooth_active) {
        const result = await requestLocationPermission();
        if (result.bluetooth && result.location) {
          changeDeviceState('bluetooth_active', true);
        }
      }
    };
    setup();

    () => {
      if (state.logging) stop();
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bluetooth_active, uuid]);
  useEffect(() => {
    // Request permissions on iOS, refresh token on Android
    Notifications.registerRemoteNotifications();

    Notifications.events().registerRemoteNotificationsRegistered(
      (event: Registered) => {
        // TODO: Send the token to my server so it could send back push notifications...
        // console.log('Device Token Received', event.deviceToken);
        // console.log(uuid, user_exist);
        if (
          uuid !== '' &&
          user_exist &&
          user_exist?.User_aggregate?.aggregate?.count === 0 &&
          !loading
        ) {
          console.log('here');
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
  }, [uuid, loading]);

  useEffect(() => {
    const device_state = async () => {
      await SystemSetting.isLocationEnabled().then((enable: boolean) => {
        changeDeviceState('location_active', enable);
      });
      await SystemSetting.addLocationListener((enabled: boolean) => {
        changeDeviceState('location_active', enabled);
      });
      await SystemSetting.isBluetoothEnabled().then((enable: boolean) => {
        changeDeviceState('bluetooth_active', enable);
      });
      await SystemSetting.addBluetoothListener((enabled: boolean) => {
        changeDeviceState('bluetooth_active', enabled);
      });
    };

    device_state();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const start = async () => {
    console.log(uuid, 'Registering Listener');

    eventEmitter.addListener('onDeviceFound', async event => {
      // console.log('onDeviceFound', event);
      if (event.serviceUuids) {
        await forEachSeries(event.serviceUuids, async (x: string) => {
          if (x && x.endsWith('00')) {
            console.log('New device found');
            await handle_device_discovery({
              uuid: x,
              contact_time: new Date(),
            });
          }
        });
      }
    });
    if (uuid !== '' && bluetooth_active && location_active) {
      console.log(uuid, 'Starting Advertising');
      BLEAdvertiser.broadcast(uuid, MANUF_DATA, {})
        .then(sucess => console.log(uuid, 'Adv Successful', sucess))
        .catch(error => console.log(uuid, 'Adv Error', error));

      console.log(uuid, 'Starting Scanner');
      BLEAdvertiser.scan(MANUF_DATA, {
        scanMode: 2,
      })
        .then(sucess => console.log(uuid, 'Scan Successful', sucess))
        .catch(error => console.log(uuid, 'Scan Error', error));
      setState({
        logging: true,
      });
    }
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

    setState({
      logging: false,
    });
  };

  const short = (str: string) => {
    return (
      str.substring(0, 4) +
      ' ... ' +
      str.substring(str.length - 4, str.length)
    ).toUpperCase();
  };

  const handle_device_discovery = async (device: Device) => {
    //new_contact
    const is_old_contact = devices.get(device.uuid);
    if (is_old_contact) {
      //seen in the last 15 minutes, should discard
      const timeDiff = Math.abs(
        is_old_contact.contact_time.getTime() - device.contact_time.getTime(),
      );
      if (timeDiff > c15_MINS) {
        console.log('here');
        update_device(device);
        updateLastSeen({
          variables: {
            primary_user: uuid,
            secondary_user: device.uuid,
            time: device.contact_time.toISOString(),
          },
        });
      }
    } else {
      update_device(device);
      const existing_contact = await check_contact_made(uuid, device.uuid);
      if (!existing_contact) {
        createNewContact({
          variables: {
            primary_user: uuid,
            secondary_user: device.uuid,
            time: device.contact_time.toISOString(),
          },
        });
      } else if (existing_contact) {
        updateLastSeen({
          variables: {
            primary_user: uuid,
            secondary_user: device.uuid,
            time: device.contact_time.toISOString(),
          },
        });
      }
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
          {state.logging ? (
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
            data={devices.values}
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
