import 'package:flutter/material.dart';

class SettingProvider extends ChangeNotifier {
  String _ip = '192.168.1.130';
  String _port = '4345';

  String get ip => _ip;
  String get port => _port;

  String get host => '$_ip:$_port';

  void setHostPort(String ip, String port) {
    if (ip.isNotEmpty) {
      _ip = ip;
    }
    if (port.isNotEmpty) {
      _port = port;
    }

    notifyListeners();
  }
}
