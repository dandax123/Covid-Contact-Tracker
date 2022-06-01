import {StyleSheet} from 'react-native';

export const homeStyles = StyleSheet.create({
  body: {
    height: '100%',
    flexDirection: 'column',
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  imageView: {
    backgroundColor: '#2C4578',
    alignItems: 'center',
    // width: '100%',
    // position: 'relative',
  },
  imageStyle: {
    width: 120,
    height: 120,
    borderRadius: 100,
    margin: 12,
  },
  cardMainStyle: {
    backgroundColor: '#2C4578',
    borderWidth: 0,
    borderRadius: 5,
    margin: 0,
    alignItems: 'center',
    width: '100%',
    height: '97%',
  },
  mainText: {
    fontSize: 22,
    margin: 10,
    color: '#F217B3',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  sectionDescription: {
    fontSize: 18,
    fontWeight: '400',
    textAlign: 'center',
  },
  highlight: {
    fontWeight: '700',
  },
  startLoggingButtonTouchable: {
    backgroundColor: '#9478F6',
    width: '100%',
    height: '100%',
    borderRadius: 12,
    borderWidth: 0,

    // alignSelf: 'center',
  },
  minorText: {
    margin: 5,
    fontSize: 14,
    color: '#ffffff',
    textAlign: 'center',
  },
  buttonContainerStyle: {
    backgroundColor: '#9478F6',
    width: 180,
    height: 35,
    borderRadius: 12,
    margin: 4,
    borderWidth: 0,
  },
  row: {
    flex: 1,
  },
  startLoggingButtonText: {
    fontSize: 14,
    lineHeight: 19,
    letterSpacing: 0,
    textAlign: 'center',
    color: '#0C7A48',
    fontWeight: 'bold',
  },
  stopLoggingButtonTouchable: {
    borderRadius: 12,
    backgroundColor: '#fd4a4a',
    height: 52,
    alignSelf: 'center',
    width: 300,
    justifyContent: 'center',
  },
  stopLoggingButtonText: {
    fontSize: 14,
    lineHeight: 19,
    letterSpacing: 0,
    textAlign: 'center',
    color: '#ffffff',
  },
  listPastConnections: {
    width: '80%',
    height: 200,
  },
  cardDivider: {
    padding: 0,
    width: '100%',
    position: 'relative',
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '400',
  },
});
