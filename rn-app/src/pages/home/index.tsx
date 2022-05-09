// import {useQuery} from '@apollo/client';
import React from 'react';
import {Text, View} from 'react-native';
// import {FETCH_USERS} from '../../graphql/queries';
import useBluetoothState from '../../store/useBluetoothState';

const Home = () => {
  const bluetooth_active = useBluetoothState(state => state.bluetooth_active);
  // const {loading, data, error} = useQuery(FETCH_USERS, {});
  // if (!b.loading) {
  // }
  //   console.log('result:', data, loading, error);
  // if (!data) return null;
  return (
    <View>{bluetooth_active ? <Text>Cool</Text> : <Text>Not cool</Text>}</View>
  );
};

export default Home;
