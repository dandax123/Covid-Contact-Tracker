import 'package:covid_19_contact_tracking_app/state/reducers.dart';
import 'package:flutter_blue/flutter_blue.dart';
import 'package:flutter_redux/flutter_redux.dart';
import 'package:redux/redux.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:flutter/material.dart';

import 'pages/welcome_page/welcome_page.dart';
import 'basic_theme/basic_theme.dart';
import 'pages/home_page/home_page.dart';

Future main() async {
  WidgetsFlutterBinding.ensureInitialized();

  final preferences = await SharedPreferences.getInstance();
  final showMainPage = preferences.getBool('showMainPage') ?? false;

  runApp(MyApp(showMainPage: showMainPage));
}

class MyApp extends StatelessWidget {
  final bool showMainPage;
  final store =
      Store<ApplicationState>(mainReducer, initialState: ApplicationState());

  MyApp({Key? key, required this.showMainPage}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    FlutterBlue flutterBlue = FlutterBlue.instance;

    print('Bluetooth state: ${flutterBlue.isOn.then((value) => print(value))}');
    flutterBlue.stopScan();
    flutterBlue.startScan(timeout: Duration(seconds: 4000));

    // Listen to scan results
    var subscription = flutterBlue.scanResults.listen((results) {
      // do something with scan results
      print('Devices found ${results.length}');
      for (ScanResult r in results) {
        print('${r.device.name} found! rssi: ${r.rssi}');
      }
    });

    return StoreProvider(
        store: store,
        child: MaterialApp(
          title: 'Positive Covid-19 Contact Tracking Mobile App',
          debugShowCheckedModeBanner: false,
          theme: basicTheme(),
          home: showMainPage ? const HomePage() : const WelcomePage(),
        ));
  }
}
