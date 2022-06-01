import {useMutation} from '@apollo/client';
import React from 'react';
import {Text, View} from 'react-native';
import {CREATE_NEW_USER_WITH_DEVICE} from '../../graphql/queries';
import {Formik} from 'formik';
import {Input, Button} from '@rneui/themed';
// import {SafeAreaView} from 'react-native-safe-area-context';
// import {Card, Button} from '@rneui/themed';
// import {regStyles} from './styles';

const RegisterComponent = ({}) => {
  const [createUser, {loading, data, error}] = useMutation(
    CREATE_NEW_USER_WITH_DEVICE,
  );
  const handleFormSubmit = (values: {
    first_name: string;
    last_name: string;
    id: string;
  }) => {
    console.log(values);
    return;
  };
  return (
    <View>
      <Formik
        initialValues={{first_name: '', last_name: '', id: ''}}
        onSubmit={handleFormSubmit}>
        {({handleChange, handleBlur, handleSubmit, values, isSubmitting}) => (
          <View>
            <Input
              label="Student / Staff ID"
              onChangeText={handleChange('id')}
              value={values.id}
              onBlur={handleBlur('id')}
            />
            <Input
              label="First Name"
              onChangeText={handleChange('first_name')}
              value={values.first_name}
              onBlur={handleBlur('first_name')}
            />
            <Input
              label="Last Name"
              onChangeText={handleChange('last_name')}
              value={values.last_name}
              onBlur={handleBlur('last_name')}
            />

            <Button
              onPress={handleSubmit}
              title="Submit"
              disabled={isSubmitting}
            />
          </View>
        )}
      </Formik>
    </View>
  );
};

export default RegisterComponent;
