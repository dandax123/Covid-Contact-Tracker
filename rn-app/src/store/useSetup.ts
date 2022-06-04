import AsyncStorage from '@react-native-async-storage/async-storage';
import create from 'zustand';
import {combine, persist} from 'zustand/middleware';

const initial_state = {
  ready_to_serve: false,
};
const useSetup = create(
  persist(
    combine(initial_state, set => ({
      setupComplete: () =>
        set({
          ready_to_serve: true,
        }),
    })),
    {
      name: 'setup',
      getStorage: () => AsyncStorage,
    },
  ),
);
export default useSetup;
