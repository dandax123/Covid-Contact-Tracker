import AsyncStorage from '@react-native-async-storage/async-storage';
import UUIDGenerator from 'react-native-uuid-generator';
const storeData = async (value: string) => {
  try {
    await AsyncStorage.setItem('storage_Key', value);
  } catch (e) {
    // saving error
  }
};

export const getAppKey = async (): Promise<string> => {
  let new_value = '';
  UUIDGenerator.getRandomUUID(async (newUid: string) => {
    new_value = newUid.slice(0, -2) + '00';
  });
  try {
    const value = await AsyncStorage.getItem('storage_Key');
    if (value) {
      return value;
    } else {
      await storeData(new_value);
      return new_value;
    }
  } catch (e) {
    return new_value;
    // error reading value
  }
};
