import create from 'zustand';
import {combine} from 'zustand/middleware';
import {Device} from '../utils/types';

type DeviceState = {
  uuid: string;
  token_id: string;
  devices: Map<string, Device>;
  ready_to_serve: boolean;
};

const initial_state: DeviceState = {
  uuid: '',
  token_id: '',
  devices: new Map<string, Device>(),
  ready_to_serve: false,
};
const useDevice = create(
  combine(initial_state, (set, get) => ({
    setup: (key: 'uuid' | 'token_id' | 'ready_to_serve', value: any) =>
      set({
        ...get(),
        [key]: value,
      }),
    update_device: (device: Device) =>
      set({...get(), devices: get().devices.set(device.uuid, device)}),
  })),
);
export default useDevice;
