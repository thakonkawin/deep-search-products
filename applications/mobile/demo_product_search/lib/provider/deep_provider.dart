import 'dart:convert';
import 'dart:io';
import 'package:path/path.dart';
import 'package:demo_product_search/models/model.dart';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;

enum Status { initial, loading, success, error }

class DeepProvider extends ChangeNotifier {
  Status status = Status.initial;
  List<ResultDeep> results = [];
  String errorMessage = '';

  Future<void> getImageVector(String host, File imageFile) async {
    status = Status.loading;
    notifyListeners();

    var uri = Uri.parse('http://$host/deep');

    var request = http.MultipartRequest('POST', uri);

    var multipartFile = await http.MultipartFile.fromPath(
      'file',
      imageFile.path,
      filename: basename(imageFile.path),
    );

    request.files.add(multipartFile);

    try {
      var response = await request.send();
      var res = await response.stream.bytesToString();

      if (response.statusCode == 200) {
        final data = jsonDecode(res);

        results = (data['matches'] as List)
            .map((e) => ResultDeep.fromJson(e))
            .toList();
        status = Status.success;
      } else {
        final err = jsonDecode(res);
        errorMessage = err['detail'] ?? 'Unknown error';
        status = Status.error;
      }
    } catch (e) {
      status = Status.error;
      errorMessage = e.toString();
    }
    notifyListeners();
  }
}
