import 'package:covid_19_contact_tracking_app/home_page.dart';
import 'package:flutter/material.dart';

class SettingsPage extends StatefulWidget {
  const SettingsPage({Key? key}) : super(key: key);

  @override
  State<SettingsPage> createState() => _SettingsPageState();
}

class _SettingsPageState extends State<SettingsPage> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Container(
          color: Colors.indigoAccent,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                  alignment: Alignment.center,
                  color: Colors.greenAccent,
                  height: 100,
                  width: double.infinity,
                  child: const Text(
                    "You are in the Settings Page",
                    style: TextStyle(
                      fontSize: 25,
                      fontWeight: FontWeight.bold,
                    ),
                  )),
              const SizedBox(height: 20),
              ElevatedButton(
                child: const Text("Go to Home Page"),
                onPressed: () async {
                  Navigator.of(context).push(
                    MaterialPageRoute(builder: (context) => const HomePage()),
                  );
                },
              ),
            ],
          ),
        ),
      ),
    );
  }
}
