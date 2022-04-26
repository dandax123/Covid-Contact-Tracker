import 'package:covid_19_contact_tracking_app/app_pages/nav_bar_pages/notify_others_page/notify_others_page.dart';
import 'package:flutter/material.dart';

class ExposuresPage extends StatefulWidget {
  const ExposuresPage({Key? key}) : super(key: key);

  @override
  State<ExposuresPage> createState() => _ExposuresPageState();
}

class _ExposuresPageState extends State<ExposuresPage> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Container(
          color: Colors.amberAccent,
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
                    "You are in the Exposures Page",
                    style: TextStyle(
                      fontSize: 25,
                      fontWeight: FontWeight.bold,
                    ),
                  )),
              const SizedBox(height: 20),
              ElevatedButton(
                child: const Text("Go to Notify Others Page"),
                onPressed: () async {
                  Navigator.of(context).push(
                    MaterialPageRoute(
                        builder: (context) => const NotifyOthersPage()),
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
