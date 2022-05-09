import create from 'zustand';
import {combine} from 'zustand/middleware';
import {Device} from '../utils/types';

// import update from 'immutability-helper';
type DeviceState = {
  uuid: string;
  token_id: string;
  devices: Device[];
};

const initial_state: DeviceState = {
  uuid: '',
  token_id: '',
  devices: [],
};
const useDevice = create(
  combine(initial_state, (set, get) => ({
    setup: (key: 'uuid' | 'token_id', value: string) =>
      set({
        ...get(),
        [key]: value,
      }),
  })),
);

// const addDevice = (
//   _uuid: string,
//   _name: string,
//   _mac: string,
//   _rssi: string,
//   _date: Date,
// ) => {
//   const index = state.devicesFound.findIndex(({uuid}) => uuid == _uuid);
//   if (index < 0) {
//     setState({
//       ...state,
//       devicesFound: [
//         ...state.devicesFound,
//         {
//           uuid: _uuid,
//           name: _name,
//           mac: _mac,
//           rssi: _rssi,
//           start: _date,
//           end: _date,
//         },
//       ],
//     });
//   } else {
//     setState({
//       ...state,
//       devicesFound: update(state.devicesFound, {
//         [index]: {
//           end: {$set: _date},
//           rssi: {$set: _rssi || state.devicesFound[index].rssi},
//         },
//       }),
//     });
//   }
// };

export default useDevice;
