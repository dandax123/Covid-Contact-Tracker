// import React from 'react';
import React, {ReactChildren, ReactNode, useEffect, useState} from 'react';
import {
  Notification,
  Notifications,
  Registered,
  RegistrationError,
} from 'react-native-notifications';
import {NativeEventEmitter} from 'react-native';

import SystemSetting from 'react-native-system-setting';
import BLEAdvertiser from 'react-native-ble-advertiser';
import {getAppKey} from './utils/key_storage';

// import {requestPermission} from './utils';
import useBluetoothState from './store/useBluetoothState';
import useDevice from './store/useDevices';
import {useMutation} from '@apollo/client';
import {
  ADD_NEW_CONTACT,
  check_contact_made,
  GET_RECENT_EXPOSURES,
  UPDATE_LAST_SEEN,
} from './graphql/queries';
import {Device} from './utils/types';
import {forEachSeries} from 'p-iteration';
import useSetup from './store/useSetup';

// Uses the Apple code to pick up iPhones
const APPLE_ID = 0x241c;
const MANUF_DATA = [1, 0];
const c10_MINS = 1000 * 60 * 10;

BLEAdvertiser.setCompanyId(APPLE_ID);

interface AuxProps {
  children: ReactNode | ReactChildren;
}

const Entry = ({children}: AuxProps) => {
  // const [createNewUser] = useMutation(CREATE_NEW_USER_WITH_DEVICE);
  const [createNewContact] = useMutation(ADD_NEW_CONTACT, {
    refetchQueries: [{query: GET_RECENT_EXPOSURES}, 'get_recent_exposures'],
  });
  const [updateLastSeen] = useMutation(UPDATE_LAST_SEEN, {
    refetchQueries: [{query: GET_RECENT_EXPOSURES}, 'get_recent_exposures'],
  });
  const {changeDeviceState, bluetooth_active, location_active} =
    useBluetoothState();

  const {setup: deviceSetup, uuid, devices, update_device} = useDevice();
  const {ready_to_serve} = useSetup();
  const [state, setState] = useState({logging: false});
  // console.log(uuid);
  const eventEmitter = new NativeEventEmitter();
  useEffect(() => {
    const setup = async () => {
      const app_key = await getAppKey();
      deviceSetup('uuid', app_key);
    };
    setup();

    () => {
      if (state.logging) {
        stop();
      }
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bluetooth_active, uuid, location_active]);

  useEffect(() => {
    // Request permissions on iOS, refresh token on Android

    Notifications.registerRemoteNotifications();

    Notifications.events().registerRemoteNotificationsRegistered(
      (event: Registered) => {
        // TODO: Send the token to my server so it could send back push notifications...
        // console.log('Device Token Received', event.deviceToken);
        // console.log('Init reg process', event.deviceToken);

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
        // console.log(
        //   `Notification received in foreground: ${notification.identifier} : ${notification.payload}`,
        // );
        // console.log(notification);
        Notifications.postLocalNotification({
          title: notification?.payload['gcm.notification.title'],
          body: notification?.payload['gcm.notification.body'],
          sound: 'default',
          badge: 0,
          type: '',
          thread: '',
          identifier: notification.identifier,
          payload: notification.payload,
        });
        // completion();

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
  }, []);

  useEffect(() => {
    const device_state = async () => {
      if (!ready_to_serve) {
        return;
      }
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
  }, [ready_to_serve]);

  useEffect(() => {
    console.log('to start');
    if (bluetooth_active && location_active && ready_to_serve) {
      start();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bluetooth_active, location_active, ready_to_serve]);

  const start = async () => {
    if (state.logging) {
      return;
    }
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

  const handle_device_discovery = async (device: Device) => {
    //new_contact
    const is_old_contact = devices.get(device.uuid);
    if (is_old_contact) {
      //seen in the last 15 minutes, should discard
      const timeDiff = Math.abs(
        is_old_contact.contact_time.getTime() - device.contact_time.getTime(),
      );
      if (timeDiff > c10_MINS) {
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

  return <>{children}</>;
};

export default Entry;
