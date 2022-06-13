import create from 'zustand';
import {combine} from 'zustand/middleware';

const useBluetoothState = create(
  combine(
    {
      bluetooth_active: false,
      location_active: false,
    },
    set => ({
      changeDeviceState: (
        key: 'bluetooth_active' | 'location_active',
        new_state: boolean,
      ) =>
        set({
          [key]: new_state,
        }),
    }),
  ),
);
export default useBluetoothState;
