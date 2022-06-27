import AsyncStorage from '@react-native-async-storage/async-storage';
import {update_user_id} from '../graphql/queries';
const storeData = async (value: string) => {
  try {
    await AsyncStorage.setItem('storage_Key', value);
  } catch (e) {
    // saving error
  }
};

export const getAppKey = async (user_id = ''): Promise<string> => {
  try {
    if (user_id !== '') {
      const new_UID = user_id.slice(0, -2) + '00';
      await update_user_id(user_id, new_UID);
      await storeData(new_UID);
    }

    const value = await AsyncStorage.getItem('storage_Key');
    if (value && value !== '') {
      return value;
    }
    throw new Error("Can't retrieve user Id");
  } catch (e) {
    throw new Error("Can't retrieve user Id");
    // error reading value
  }
};
