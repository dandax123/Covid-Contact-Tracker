import 'package:covid_19_contact_tracking_app/state/actions.dart';

class ApplicationState {
  bool bluetoothStatus;
  String deviceId;
  ApplicationState({this.bluetoothStatus = false, this.deviceId = ""});
}

ApplicationState mainReducer(ApplicationState state, action) {
  if (action is changeBluetoothState) {
    return ApplicationState(
        deviceId: state.deviceId, bluetoothStatus: !state.bluetoothStatus);
  } else {
    return state;
  }
}
