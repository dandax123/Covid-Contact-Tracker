import 'package:smooth_page_indicator/smooth_page_indicator.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:flutter/material.dart';

import 'components/build_welcome_page.dart';
import '../../constant_variables.dart';
import 'package:covid_19_contact_tracking_app/pages/home_page/home_page.dart';

class WelcomePage extends StatefulWidget {
  const WelcomePage({Key? key}) : super(key: key);

  @override
  State<WelcomePage> createState() => _WelcomePageState();
}

class _WelcomePageState extends State<WelcomePage> {
  final controller = PageController();
  bool isLastPage = false;

  @override
  void dispose() {
    controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Container(
          padding: const EdgeInsets.only(bottom: 100),
          child: PageView(
            controller: controller,
            onPageChanged: (index) {
              setState(() => isLastPage = index == 4);
            },
            children: [
              BuildWelcomePage(
                context: context,
                urlImage: 'assets/images/welcome.png',
                title: 'Welcome',
                subTitle:
                    'With the contribution of all, app will help us contain COVID-19 and return to our normal life as soon as possible',
              ),
              BuildWelcomePage(
                context: context,
                urlImage: 'assets/images/protect_yourself.png',
                title: 'Use App to protect yourself',
                subTitle:
                    'If you have contacted a person who is COVID-19 positive, -app- notifies and gives you directions to protect your health and your beloved ones',
              ),
              BuildWelcomePage(
                context: context,
                urlImage: 'assets/images/privacy_is_protected.png',
                title: 'Your privacy is protected',
                subTitle:
                    '-app- works without knowing you identity, nor that of the persons with whom you get in contact, and does not need to specify your location',
              ),
              BuildWelcomePage(
                context: context,
                urlImage: 'assets/images/turn_on_bluetooth.png',
                title: 'Turn on Bluetooth',
                subTitle:
                    '-app- uses Bluetooth to share your random IDs for the past 14 days to help determine who should be notified that you may have been exposed to COVID-19 positive cases',
              ),
              BuildWelcomePage(
                context: context,
                urlImage: 'assets/images/turn_on_bluetooth.png',
                title: 'Allow Notifications',
                subTitle:
                    'By activating notifications, -app- will notify you immediately if you have been in close contact with a person who is COVID-19 positive during the past 14 days',
              ),
            ],
          ),
        ),
      ),
      bottomSheet: Container(
        padding: const EdgeInsets.only(left: 20, right: 20),
        height: 100,
        color: Colors.black,
        child: Column(
          children: [
            Center(
              child: SmoothPageIndicator(
                controller: controller,
                count: 5,
                effect: WormEffect(
                  dotColor: Colors.grey.shade600,
                  activeDotColor: mainColor,
                  dotHeight: 6,
                  dotWidth: 6,
                ),
              ),
            ),
            Container(
              padding: const EdgeInsets.only(top: 20),
              width: double.infinity,
              height: 70,
              child: !isLastPage
                  ? ElevatedButton(
                      child: const Text("Next"),
                      onPressed: () => controller.nextPage(
                        duration: const Duration(milliseconds: 500),
                        curve: Curves.easeInOut,
                      ),
                    )
                  : ElevatedButton(
                      child: const Text("Get Started"),
                      onPressed: () async {
                        final preferences =
                            await SharedPreferences.getInstance();
                        preferences.setBool('showMainPage', true);

                        Navigator.of(context).pushReplacement(
                          MaterialPageRoute(
                              builder: (context) => const HomePage()),
                        );
                      },
                    ),
            ),
          ],
        ),
      ),
    );
  }
}
