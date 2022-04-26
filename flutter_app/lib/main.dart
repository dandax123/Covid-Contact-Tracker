import 'package:shared_preferences/shared_preferences.dart';
import 'package:flutter/material.dart';

import 'app_pages/welcome_page/welcome_page.dart';
import 'basic_theme/basic_theme.dart';
import 'home_page.dart';

Future main() async {
  WidgetsFlutterBinding.ensureInitialized();

  final preferences = await SharedPreferences.getInstance();
  final showMainPage = preferences.getBool('showMainPage') ?? false;

  runApp(MyApp(showMainPage: showMainPage));
}

class MyApp extends StatelessWidget {
  final bool showMainPage;

  const MyApp({Key? key, required this.showMainPage}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Positive Covid-19 Contact Tracking Mobile App',
      debugShowCheckedModeBanner: false,
      theme: basicTheme(),
      home: showMainPage ? const HomePage() : const WelcomePage(),
    );
  }
}
