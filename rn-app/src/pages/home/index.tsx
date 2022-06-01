// import {useQuery} from '@apollo/client';
import React from 'react';
import {Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Card, Button} from '@rneui/themed';
import {homeStyles} from './styles';
// import {FETCH_USERS} from '../../graphql/queries';
import SystemSetting from 'react-native-system-setting';

import useBluetoothState from '../../store/useBluetoothState';

const Home = () => {
  const {bluetooth_active, location_active} = useBluetoothState(state => state);

  return (
    <SafeAreaView>
      <View style={homeStyles.body}>
        <View style={homeStyles.row}>
          <StatusComponent enabled={bluetooth_active && location_active} />
        </View>
        <View style={homeStyles.row}>
          <Text>Exposures</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const StatusComponent: React.FC<{enabled: boolean}> = ({enabled}) => {
  const {bluetooth_active, location_active} = useBluetoothState(state => state);
  const handleButtonPress = async () => {
    if (!location_active) {
      await SystemSetting.switchLocation();
    }
    if (!bluetooth_active) {
      await SystemSetting.switchBluetooth();
    }

    if (bluetooth_active) {
      await SystemSetting.switchBluetoothSilence();
    }

    if (location_active) {
      await SystemSetting.switchLocation();
    }
  };
  return (
    <Card containerStyle={homeStyles.cardMainStyle}>
      <View style={homeStyles.imageView}>
        <Card.Image
          source={{
            uri: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSNARDmtF-GcrS353ErLwh52tzcATMokTevEg&usqp=CAU',
          }}
          style={homeStyles.imageStyle}
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
        <Button
          title={!enabled ? 'ENABLE' : 'DISABLE'}
          raised
          buttonStyle={homeStyles.startLoggingButtonTouchable}
          containerStyle={homeStyles.buttonContainerStyle}
          titleStyle={homeStyles.startLoggingButtonText}
          activeOpacity={10}
          onPress={() => handleButtonPress}
        />
      </View>
    </Card>
  );
};
export default Home;
