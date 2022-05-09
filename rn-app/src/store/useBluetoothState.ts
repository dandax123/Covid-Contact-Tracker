import create from 'zustand';
import {combine} from 'zustand/middleware';

const useBluetoothState = create(
  combine(
    {
      bluetooth_active: false,
    },
    set => ({
      changeBluetoothState: (new_state: boolean) =>
        set({
          bluetooth_active: new_state,
        }),
    }),
  ),
);
export default useBluetoothState;
