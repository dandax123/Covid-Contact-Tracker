import 'package:flutter/material.dart';

import '../constant_variables.dart';

ThemeData basicTheme() {
  TextTheme _basicTextTheme(TextTheme base) {
    return base.copyWith(
      headline6: base.headline6!.copyWith(
        fontFamily: 'Poppins',
        fontSize: 28.0,
        color: Colors.white,
      ),
      bodyText2: base.bodyText2!.copyWith(
        fontFamily: 'Poppins',
        fontSize: 15.0,
        color: Colors.white,
      ),
      caption: base.caption!.copyWith(
        fontFamily: 'Poppins',
        fontSize: 12.0,
        color: Colors.grey.shade600,
      ),
    );
  }

  final ThemeData base = ThemeData.dark();
  return base.copyWith(
    textTheme: _basicTextTheme(base.textTheme),
    primaryColor: Colors.black,
    iconTheme: const IconThemeData(
      color: mainColor,
      size: 20.0,
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        primary: mainColor,
        textStyle: const TextStyle(
          fontSize: 20,
          fontWeight: FontWeight.w500,
        ),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(10),
        ),
      ),
    ),
  );
}
