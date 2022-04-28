import React, {useContext, useEffect, useState} from 'react';
import {BleManager, Device, ScanMode, State} from 'react-native-ble-plx';
import {Alert, PermissionsAndroid, Text, View} from 'react-native';

export interface AppState {
  manager: BleManager;
  devices: Map<string, Device>;
}

const initialState: AppState = {
  manager: new BleManager(),
  devices: new Map(), ///
};

export const GlobalContext = React.createContext<AppState>(initialState);

async function getBluetoothScanPermission() {
  const granted = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
    {
      title: 'Bluetooth Permission',
      message:
        'In the next dialogue, Android will ask for permission for this ' +
        'App to access your location. This is needed for being able to ' +
        'use Bluetooth to scan your environment for peripherals.',
      buttonPositive: 'OK',
    },
  );
  if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
    console.log('BleManager.scan will *NOT* detect any peripherals!');
  }
}
interface PropsType {}
const GlobalContextWrapper: React.FC<PropsType> = props => {
  const {manager} = useContext(GlobalContext);
  const [isScanning, setIsScanning] = useState(false);

  const [devices, setDevices] = useState<Map<string, Device>>(new Map());
  const [deviceState, setDeviceState] = useState<State>(State.Unknown);

  useEffect(() => {
    const startTime = new Date();
    const testAndToggleBle = manager.onStateChange(async bleState => {
      setDeviceState(() => bleState);
      switch (bleState) {
        case State.PoweredOn: {
          console.log(isScanning, startTime);
          if (!isScanning) {
            manager.startDeviceScan(
              null,
              {allowDuplicates: true, scanMode: ScanMode.Balanced},
              (error, device) => {
                // strip the ms

                if (error) {
                  console.error(JSON.stringify(error));
                  setIsScanning(false);
                  manager.stopDeviceScan();
                  return;
                }
                if (device) {
                  // console.log(device.id);
                  updateDevices(device);
                  // manager.stopDeviceScan();
                }
              },
            );
          }
          // testAndToggleBle.remove();
          break;
        }
        case State.PoweredOff: {
          await manager.enable();
          break;
        }
        default: {
          await manager.enable();
          break;
        }
      }
    }, true);
    const updateDevices = (dev?: Device) => {
      if (dev) {
        if (!devices.has(dev.id)) {
          console.log();
          console.log(dev.id, JSON.stringify(dev));
          console.log();
        }
        setDevices(new Map(devices.set(dev.id, dev)));
      } else {
        setDevices(new Map());
      }
    };

    () => {
      manager.stopDeviceScan();
      // manager.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isScanning]);

  // Check for bluetooth on device

  // console.log(devices);

  // alert a message to the user
  const alert = (msg: string) => Alert.alert(msg);

  // Add a new scanned device

  return (
    <GlobalContext.Provider
      value={{
        manager,
        devices,
      }}>
      {props.children}
    </GlobalContext.Provider>
  );
};

export default GlobalContextWrapper;
