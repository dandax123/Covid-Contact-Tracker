/* eslint-disable react-native/no-inline-styles */
// import {useQuery} from '@apollo/client';
import React, {useEffect, useState} from 'react';
import {Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Card, Button} from '@rneui/themed';
import {homeStyles} from './styles';

// import
// import {FETCH_USERS} from '../../graphql/queries';

import useBluetoothState from '../../store/useBluetoothState';
import {requestPermission, transformExposureData} from '../../utils';
import {FlatList} from 'react-native-gesture-handler';
import {Exposure} from '../../utils/types';
import {useQuery} from '@apollo/client';
import {GET_RECENT_EXPOSURES} from '../../graphql/queries';
import useDevice from '../../store/useDevices';
import {Icon} from '@rneui/themed';

const Img_set = {
  good: require('../../utils/img/good_state.jpeg'),
  bad: require('../../utils/img/bad_state.jpeg'),
};

const Home = () => {
  const {bluetooth_active, location_active} = useBluetoothState(state => state);
  const {uuid: user_id} = useDevice();
  const [mainData, setMainData] = useState<Array<Exposure>>([]);
  const {data, loading} = useQuery(GET_RECENT_EXPOSURES, {
    pollInterval: 500,
    variables: {
      user_id,
    },
  });
  useEffect(() => {
    if (data) {
      setMainData(() => transformExposureData(user_id, data));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, loading]);
  // console.log(data);
  return (
    <SafeAreaView>
      <View style={homeStyles.body}>
        <View style={homeStyles.row}>
          <StatusComponent enabled={bluetooth_active && location_active} />
        </View>
        <View style={homeStyles.row}>
          <Text style={{color: '#ffffff'}}>Recent Exposures</Text>
          {mainData?.length ? (
            <FlatList data={mainData} renderItem={ListItem} />
          ) : (
            <View style={homeStyles.listItemMainStyle}>
              <Text
                style={{
                  ...homeStyles.listItemTextStyle,
                  marginVertical: 7,
                  textAlign: 'center',
                }}>
                No recent exposures. Stay Safe!
              </Text>
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

const ListItem: React.FC<{item: Exposure}> = ({item}) => {
  return (
    <View key={item.contact_id} style={homeStyles.listItemMainStyle}>
      <Text style={homeStyles.listItemTextStyle}>
        {item.first_name} {item.last_name}
      </Text>
      <View style={homeStyles.iconTextStyle}>
        <View style={{flex: 1}}>
          <Icon
            name="clock"
            type="feather"
            size={17}
            iconStyle={{color: '#ffffff', margin: 0, padding: 0}}
          />
        </View>
        <View style={{flex: 9}}>
          <Text>{item.contact_time}</Text>
        </View>
      </View>
    </View>
  );
};
const StatusComponent: React.FC<{enabled: boolean}> = ({enabled}) => {
  const {bluetooth_active, location_active} = useBluetoothState(state => state);
  const handleButtonPress = async () => {
    await requestPermission(bluetooth_active, location_active);
  };
  return (
    <Card containerStyle={homeStyles.cardMainStyle}>
      <View style={homeStyles.imageView}>
        <Card.Image
          source={enabled ? Img_set.good : Img_set.bad}
          containerStyle={homeStyles.imageStyle}
        />
        <Text style={homeStyles.mainText}>
          {!enabled
            ? 'The application is not active'
            : 'The application is active'}
        </Text>
        <Card.Divider style={homeStyles.cardDivider} />
        <Text style={homeStyles.minorText}>
          {!enabled
            ? 'Your phone is inactive to detect COVID-19 cases you may be exposed to'
            : 'Your phone is currently active and detecting possible COVID-19 cases'}
        </Text>
        {!enabled ? (
          <Button
            title={'ENABLE'}
            raised
            buttonStyle={homeStyles.startLoggingButtonTouchable}
            containerStyle={homeStyles.buttonContainerStyle}
            titleStyle={homeStyles.startLoggingButtonText}
            activeOpacity={10}
            onPress={handleButtonPress}
          />
        ) : null}
      </View>
    </Card>
  );
};
export default Home;
