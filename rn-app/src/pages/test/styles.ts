import {StyleSheet} from 'react-native';

export const testStyles = StyleSheet.create({
  body: {
    height: '100%',
    flexDirection: 'column',
    paddingHorizontal: 12,
    paddingVertical: 20,
  },
  dialogStyle: {
    backgroundColor: '#17202A',
    padding: 10,
  },
  buttonContainerStyle: {
    backgroundColor: '#9478F6',
    // width: 180,
    // height: 35,
    borderRadius: 0,
    // margin: 4,
    // padding: 4,
    // marginLeft: 10,
    borderWidth: 0,
  },
  cancelText: {
    fontSize: 14,
    lineHeight: 19,
    letterSpacing: 0,
    textAlign: 'center',
    color: '#ffffff',
  },
  mainText: {
    color: '#ffffff',
    fontSize: 16,
  },
  mainTextBody: {
    flex: 2,
    height: '100%',
    justifyContent: 'center',
  },
  testResultBody: {
    flex: 3,
  },
  shareButton: {
    marginTop: 15,
    marginBottom: 5,
    // backgroundColor: '#9478F6',
  },
});
