import {useMutation} from '@apollo/client';
import React from 'react';
import {View} from 'react-native';
import {CREATE_NEW_USER_WITH_DEVICE} from '../../graphql/queries';
import {Formik} from 'formik';
import {Input, Button} from '@rneui/themed';
// import {SafeAreaView} from 'react-native-safe-area-context';
// import {Card, Button} from '@rneui/themed';
import {regStyles} from './styles';
import useDevice from '../../store/useDevices';

const RegisterComponent = ({}) => {
  const {uuid, token_id} = useDevice();
  const [createUser, {loading}] = useMutation(CREATE_NEW_USER_WITH_DEVICE);
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
      <Formik
        initialValues={{first_name: '', last_name: '', id: ''}}
        onSubmit={handleFormSubmit}>
        {({handleChange, handleBlur, handleSubmit, values}) => (
          <View>
            <Input
              label="Student / Staff ID"
              onChangeText={handleChange('id')}
              value={values.id}
              onBlur={handleBlur('id')}
              labelStyle={regStyles.labelStyle}
              placeholder={'10000000'}
              inputStyle={regStyles.inputStyle}
            />
            <Input
              label="First Name"
              onChangeText={handleChange('first_name')}
              value={values.first_name}
              onBlur={handleBlur('first_name')}
              labelStyle={regStyles.labelStyle}
              inputStyle={regStyles.inputStyle}
            />
            <Input
              label="Last Name"
              onChangeText={handleChange('last_name')}
              value={values.last_name}
              onBlur={handleBlur('last_name')}
              labelStyle={regStyles.labelStyle}
              inputStyle={regStyles.inputStyle}
            />

            <Button
              onPress={handleSubmit}
              title="Submit"
              disabled={loading}
              buttonStyle={regStyles.buttonStyle}
              containerStyle={regStyles.btnContainerStyle}
            />
          </View>
        )}
      </Formik>
    </View>
  );
};

export default RegisterComponent;
