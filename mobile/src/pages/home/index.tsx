// import {useQuery} from '@apollo/client';
import React from 'react';
import {Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Card, Button} from '@rneui/themed';
import {homeStyles} from './styles';

// import
// import {FETCH_USERS} from '../../graphql/queries';

import useBluetoothState from '../../store/useBluetoothState';
import {requestPermission} from '../../utils';

const Img_set = {
  good: require('../../utils/img/good_state.jpeg'),
  bad: require('../../utils/img/bad_state.jpeg'),
};
const Home = () => {
  const {bluetooth_active, location_active} = useBluetoothState(state => state);

  return (
    <SafeAreaView>
      <View style={homeStyles.body}>
        <View style={homeStyles.row}>
          <StatusComponent enabled={bluetooth_active && location_active} />
        </View>
        <View style={homeStyles.row}></View>
      </View>
    </SafeAreaView>
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
