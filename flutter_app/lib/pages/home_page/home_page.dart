import 'package:covid_19_contact_tracking_app/pages/nav_bar_pages/exposures_page/exposures_page.dart';
import 'package:covid_19_contact_tracking_app/pages/welcome_page/welcome_page.dart';
import 'package:covid_19_contact_tracking_app/constant_variables.dart';
import 'package:flutter/material.dart';

class HomePage extends StatelessWidget {
  const HomePage({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Container(
          color: Colors.blueAccent,
          child: Center(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.center,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Container(
                  alignment: Alignment.center,
                  height: 100,
                  width: double.infinity,
                  color: Colors.yellow,
                  child: const Text(
                    "You are in the Home Page",
                    style: TextStyle(
                      color: mainColor,
                      fontSize: 25,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
                const SizedBox(height: 40),
                ElevatedButton(
                  child: const Text("Go to Welcome Page"),
                  onPressed: () async {
                    Navigator.of(context).push(
                      MaterialPageRoute(
                          builder: (context) => const WelcomePage()),
                    );
                  },
                ),
                const SizedBox(height: 20),
                ElevatedButton(
                  child: const Text("Go to Exposures Page"),
                  onPressed: () async {
                    Navigator.of(context).push(
                      MaterialPageRoute(
                          builder: (context) => const ExposuresPage()),
                    );
                  },
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
