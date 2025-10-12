import 'package:flutter/material.dart';

class BarcodeProvider extends ChangeNotifier {
  String _barcode = '';

  String get barcode => _barcode;

  void setBarcode(String value) {
    _barcode = value;
    notifyListeners();
  }
}
