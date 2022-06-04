import {StyleSheet} from 'react-native';

export const regStyles = StyleSheet.create({
  labelStyle: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 20,
  },
  inputStyle: {
    color: '#ffffff',
  },
  mainFormStyle: {
    marginVertical: 20,
    backgroundColor: '#17202A',
    borderRadius: 8,
    paddingVertical: 15,

    // backgroundColor: '#ffffff',
  },
  buttonStyle: {
    // alignSelf: 'center',
    // textAlign: 'center',
    // width: '100%',
    borderRadius: 8,

    textTransform: 'capitalize',
  },
  btnContainerStyle: {
    alignSelf: 'center',
    // textAlign: 'center',
    // alignContent: 'center',
    maxWidth: 200,
    width: '100%',
    margin: 10,
    borderRadius: 8,
  },
  mainStyle: {
    height: '100%',
    flexDirection: 'column',
    paddingHorizontal: 2,
    paddingVertical: 20,
    justifyContent: 'center',
  },
});
