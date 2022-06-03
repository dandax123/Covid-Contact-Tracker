import {useMutation, useQuery} from '@apollo/client';
import {Button} from '@rneui/base';
import {Dialog} from '@rneui/themed';
import React from 'react';
import {useEffect} from 'react';
import {useState} from 'react';
import {View, Text} from 'react-native';
import {COVID_TEST, GET_LAST_COVID_TEST} from '../../graphql/queries';
import useDevice from '../../store/useDevices';

import {testStyles} from './styles';
const c14_DAYS = 1.21e9;
const Test = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [takeTest, setTakeTest] = useState(false);
  const {uuid} = useDevice();
  const [createTest, {loading}] = useMutation(COVID_TEST, {
    refetchQueries: [{query: GET_LAST_COVID_TEST}, 'get_lastest_user_test'],
  });
  const {data: prevTestData} = useQuery(GET_LAST_COVID_TEST, {
    variables: {
      user: uuid,
    },
  });

  useEffect(() => {
    console.log(prevTestData);
    if (prevTestData) {
      const time = new Date(prevTestData?.CovidTest[0]?.test_time);
      if (Math.abs(time.getTime() - new Date().getTime()) > c14_DAYS) {
        setTakeTest(true);
      }
    }
  }, [prevTestData]);
  const handleSubmit = () => {
    createTest({
      variables: {
        user: uuid,
      },
    });
    setIsVisible(false);
    setTakeTest(false);
  };
  return (
    <View style={testStyles.body}>
      <View style={testStyles.mainTextBody}>
        <Text style={{...testStyles.mainText, marginBottom: 10}}>
          Share your COVID-19 Positive Diagnosis
        </Text>
        <Text style={testStyles.mainText}>
          if you tested positive for COVID-19, you can choose to share your
          diagnosis. This will help others contain the spread of the virus.
          Sharing your diagnosis is a great social deed. It will contribute in
          saving lives!
        </Text>
        <Text style={testStyles.mainText}>
          Users will be notified that they have been exposed the virus during
          the past 14 days to take the necessary measure.
        </Text>
        <Button
          title={'SHARE YOUR POSITIVE DIAGNOSIS'}
          containerStyle={testStyles.shareButton}
          onPress={() => setIsVisible(true)}
          disabled={!takeTest}
        />
        {!takeTest ? (
          <Text>You have taken a test in the last 14 days.</Text>
        ) : null}
      </View>
      <View style={testStyles.testResultBody}>
        <Text style={testStyles.mainText}>Past Test Result </Text>
      </View>
      <Dialog
        isVisible={isVisible}
        overlayStyle={testStyles.dialogStyle}
        onBackdropPress={() => setIsVisible(false)}>
        <View style={{padding: 10}}>
          <Text style={testStyles.mainText}>
            Are you sure that you want to share your positive COVID-19
            diagnosis?
          </Text>
        </View>
        <Dialog.Actions>
          <Dialog.Button
            title={'Submit'}
            titleStyle={testStyles.cancelText}
            containerStyle={testStyles.buttonContainerStyle}
            onPress={handleSubmit}
          />
          <Dialog.Button
            title={'Cancel'}
            type={'outline'}
            onPress={() => setIsVisible(false)}
            titleStyle={testStyles.cancelText}
          />
        </Dialog.Actions>
      </Dialog>
    </View>
  );
};
export default Test;
