import 'dart:convert';

import 'package:demo_product_search/models/product.dart';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;

// import 'package:flutter/material.dart';

// import 'dart:convert';

enum ScreenStatus { initial, loading, success, error }

class ProductProvider extends ChangeNotifier {
  ScreenStatus status = ScreenStatus.initial;
  List<Product> products = [];
  Product? selectedProduct;
  String errorMessage = '';

  Future<void> getProductsList(String host) async {
    status = ScreenStatus.loading;
    notifyListeners();

    try {
      final response = await http.get(Uri.parse('http://$host/products'));
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        products = (data as List)
            .map((item) => Product.fromListJson(item))
            .toList();
        status = ScreenStatus.success;
        selectedProduct = null;
      } else {
        final err = jsonDecode(response.body);
        errorMessage = err['detail'] ?? 'Unknown error';
        status = ScreenStatus.error;
      }
    } catch (e) {
      status = ScreenStatus.error;
      errorMessage = e.toString();
    }
    notifyListeners();
  }

  Future<void> getProductDetail(String host, String code) async {
    status = ScreenStatus.loading;
    notifyListeners();

    try {
      final response = await http.get(Uri.parse('http://$host/products/$code'));
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        selectedProduct = Product.fromDetailJson(data);
        status = ScreenStatus.success;
        products = [];
      } else {
        final err = jsonDecode(response.body);
        errorMessage = err['detail'] ?? 'Unknown error';
        status = ScreenStatus.error;
      }
    } catch (e) {
      status = ScreenStatus.error;
      errorMessage = e.toString();
    }
    notifyListeners();
  }
}
