import create from 'zustand';
import {combine} from 'zustand/middleware';
import {Device} from '../utils/types';

type DeviceState = {
  uuid: string;
  token_id: string;
  devices: Map<string, Device>;
};

const initial_state: DeviceState = {
  uuid: '',
  token_id: '',
  devices: new Map<string, Device>(),
};
const useDevice = create(
  combine(initial_state, (set, get) => ({
    setup: (key: 'uuid' | 'token_id', value: string) =>
      set({
        ...get(),
        [key]: value,
      }),
    update_device: (device: Device) =>
      set({...get(), devices: get().devices.set(device.uuid, device)}),
  })),
);
export default useDevice;
