import 'package:flutter/material.dart';

class BuildWelcomePage extends StatelessWidget {
  const BuildWelcomePage({
    Key? key,
    required this.context,
    required this.urlImage,
    required this.title,
    required this.subTitle,
  }) : super(key: key);

  final BuildContext context;
  final String urlImage;
  final String title;
  final String subTitle;

  @override
  Widget build(BuildContext context) => Container(
        padding: const EdgeInsets.all(10),
        color: Colors.black,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Image.asset(
              urlImage,
              fit: BoxFit.cover,
              width: double.infinity,
            ),
            const SizedBox(height: 30),
            Padding(
              padding: const EdgeInsets.only(left: 5, right: 5),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: Theme.of(context).textTheme.headline6,
                    softWrap: true,
                  ),
                  const SizedBox(height: 20),
                  Text(
                    subTitle,
                    style: Theme.of(context).textTheme.bodyText2,
                    softWrap: true,
                  ),
                ],
              ),
            ),
          ],
        ),
      );
}
