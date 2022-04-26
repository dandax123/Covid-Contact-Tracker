import 'package:covid_19_contact_tracking_app/app_pages/nav_bar_pages/settings_page/settings_page.dart';
import 'package:flutter/material.dart';

class NotifyOthersPage extends StatefulWidget {
  const NotifyOthersPage({Key? key}) : super(key: key);

  @override
  State<NotifyOthersPage> createState() => _NotifyOthersPageState();
}

class _NotifyOthersPageState extends State<NotifyOthersPage> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Container(
          color: Colors.greenAccent,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                  alignment: Alignment.center,
                  color: Colors.amberAccent,
                  height: 100,
                  width: double.infinity,
                  child: const Text(
                    "You are in the Notify Others Page",
                    style: TextStyle(
                      fontSize: 25,
                      fontWeight: FontWeight.bold,
                    ),
                    textAlign: TextAlign.center,
                  )),
              const SizedBox(height: 20),
              ElevatedButton(
                child: const Text("Go to Settings Page"),
                onPressed: () async {
                  Navigator.of(context).push(
                    MaterialPageRoute(
                        builder: (context) => const SettingsPage()),
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
