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

    borderRadius: 8,
    paddingVertical: 15,
  },
  imageStyle: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  imgCStyle: {
    width: '50%',
    height: '100%',
  },
  errorStyle: {
    color: '#ffffff',
    fontSize: 48,
    fontFamily: 'Georgia, serif',
    margin: 10,
    marginVertical: 8,
    textAlign: 'center',
  },
  buttonStyle: {
    borderRadius: 8,

    textTransform: 'capitalize',
  },
  uniqueError: {
    fontSize: 18,
    color: '#CC0C18',
    marginLeft: 10,
  },
  btnContainerStyle: {
    alignSelf: 'center',
    maxWidth: 200,
    width: '100%',
    margin: 10,
    borderRadius: 8,
  },
  mainStyle: {
    height: '100%',
    flexDirection: 'column',
    width: '100%',
    paddingHorizontal: 2,
    paddingVertical: 20,
    justifyContent: 'center',
    backgroundColor: '#17202A',
  },
});
