/* eslint-disable react-native/no-inline-styles */
import {useMutation} from '@apollo/client';
import React, {useEffect} from 'react';
import {View, Text} from 'react-native';
import {CREATE_NEW_USER_WITH_DEVICE} from '../../graphql/queries';
import {Formik} from 'formik';
import {Input, Button, Icon, Image} from '@rneui/themed';
// import {SafeAreaView} from 'react-native-safe-area-context';
// import {Card, Button} from '@rneui/themed';
import {regStyles} from './styles';
import useDevice from '../../store/useDevices';
import useSetup from '../../store/useSetup';

import * as Yup from 'yup';
import {useState} from 'react';

const logo = require('../../utils/img/logo.png');

const registerSchema = Yup.object().shape({
  id: Yup.number()
    .max(99999999, 'Student number is too long')
    .min(9999999, 'Student number is too short')
    .required('Provide your student Number'),
  first_name: Yup.string()
    .min(2, 'Too Short!')
    .max(50, 'Too Long!')
    .required('Required'),
  last_name: Yup.string()
    .min(2, 'Too Short!')
    .max(50, 'Too Long!')
    .required('Required'),
});
const RegisterComponent = ({}) => {
  const {uuid, token_id} = useDevice();
  const {setupComplete} = useSetup();
  const [id_error, setIdError] = useState(false);
  const [createUser, {loading, data, error}] = useMutation(
    CREATE_NEW_USER_WITH_DEVICE,
  );

  useEffect(() => {
    console.log('ran');
    if (!loading && data?.insert_User_one?.user_id) {
      setupComplete();
    } else if (!loading && error?.message?.includes('Uniqueness violation')) {
      setIdError(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);
  const handleFormSubmit = (values: {
    first_name: string;
    last_name: string;
    id: string;
  }) => {
    const {first_name, last_name, id} = values;

    if (uuid !== '' && token_id !== '') {
      createUser({
        variables: {
          user_id: uuid,
          device_id: token_id,
          first_name,
          last_name,
          school_id: id,
        },
      });
    }
    return;
  };
  return (
    <View style={regStyles.mainStyle}>
      <View style={{flex: 1, alignItems: 'center'}}>
        <Image
          source={logo}
          style={regStyles.imageStyle}
          containerStyle={regStyles.imgCStyle}
        />
      </View>
      <View style={{flex: 3}}>
        <Text style={regStyles.errorStyle}>Sign up </Text>
        <Formik
          initialValues={{first_name: '', last_name: '', id: ''}}
          validationSchema={registerSchema}
          onSubmit={handleFormSubmit}>
          {({
            handleChange,
            handleBlur,
            handleSubmit,
            values,
            errors,
            touched,
            isSubmitting,
          }) => (
            <View style={regStyles.mainFormStyle}>
              <Input
                label="Student / Staff ID"
                onChangeText={handleChange('id')}
                value={values.id}
                onBlur={handleBlur('id')}
                labelStyle={regStyles.labelStyle}
                placeholder={'10000000'}
                leftIcon={
                  <Icon
                    name="school-outline"
                    type="ionicon"
                    size={24}
                    color="white"
                  />
                }
                inputStyle={regStyles.inputStyle}
                errorMessage={errors.id && touched.id ? errors.id : ''}
              />

              <Input
                label="First Name"
                onChangeText={handleChange('first_name')}
                value={values.first_name}
                onBlur={handleBlur('first_name')}
                labelStyle={regStyles.labelStyle}
                leftIcon={{
                  type: 'ionicon',
                  name: 'person-outline',
                  color: '#ffffff',
                }}
                inputStyle={regStyles.inputStyle}
                errorMessage={
                  errors.first_name && touched.first_name
                    ? errors.first_name
                    : ''
                }
              />

              <Input
                label="Last Name"
                onChangeText={handleChange('last_name')}
                value={values.last_name}
                onBlur={handleBlur('last_name')}
                leftIcon={{
                  type: 'ionicon',
                  name: 'person-outline',
                  color: '#ffffff',
                }}
                labelStyle={regStyles.labelStyle}
                inputStyle={regStyles.inputStyle}
                errorMessage={
                  errors.last_name && touched.last_name ? errors.last_name : ''
                }
              />
              {id_error ? (
                <Text style={regStyles.uniqueError}>
                  Student Number is already registered
                </Text>
              ) : null}
              <Button
                onPress={handleSubmit}
                title="Submit"
                loading={loading && isSubmitting}
                buttonStyle={regStyles.buttonStyle}
                containerStyle={regStyles.btnContainerStyle}
              />
            </View>
          )}
        </Formik>
      </View>
    </View>
  );
};

export default RegisterComponent;
