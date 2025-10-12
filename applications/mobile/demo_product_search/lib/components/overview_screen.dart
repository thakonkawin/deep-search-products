import 'package:camera/camera.dart';
import 'package:demo_product_search/components/product_screen.dart';
import 'package:demo_product_search/provider/barcode_provider.dart';
import 'package:demo_product_search/provider/product_provider.dart';
import 'package:demo_product_search/provider/setting_provider.dart';
import 'package:flutter/material.dart';
import 'package:simple_barcode_scanner/simple_barcode_scanner.dart';
import 'package:provider/provider.dart';
import 'setting_screen.dart';
import 'take_picture_screen.dart';

class OverViewScreen extends StatefulWidget {
  const OverViewScreen({super.key, required this.camera});

  final CameraDescription camera;

  @override
  State<OverViewScreen> createState() => _OverViewScreenState();
}

class _OverViewScreenState extends State<OverViewScreen> {
  late final TextEditingController _controller;

  @override
  void initState() {
    super.initState();

    _controller = TextEditingController();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final padding = MediaQuery.of(context).padding;
    final barcodeProvider = context.read<BarcodeProvider>();
    final productProvider = context.read<ProductProvider>();
    final settingProvider = context.read<SettingProvider>();
    return Center(
      child: Scaffold(
        body: Padding(
          padding: EdgeInsets.fromLTRB(
            padding.left,
            padding.top,
            padding.right,
            padding.bottom,
          ),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                padding: const EdgeInsets.all(16),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      "Deep Product Search",
                      style: TextStyle(
                        fontSize: 28,
                        fontWeight: FontWeight.bold,
                        color: Colors.tealAccent,
                      ),
                    ),
                    IconButton(
                      icon: const Icon(
                        Icons.settings,
                        color: Colors.yellowAccent,
                      ),
                      iconSize: 28,
                      onPressed: () {
                        Navigator.of(context).push(
                          MaterialPageRoute(
                            builder: (context) => const SettingScreen(),
                          ),
                        );
                      },
                    ),
                  ],
                ),
              ),
              ProductScreen(),
              Container(
                color: Colors.grey[700],
                padding: const EdgeInsets.all(8),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Row(
                      children: [
                        Expanded(
                          flex: 3,
                          child: Consumer<BarcodeProvider>(
                            builder: (context, barcodeProvider, child) {
                              return TextField(
                                controller:
                                    TextEditingController(
                                        text: barcodeProvider.barcode,
                                      )
                                      ..selection = TextSelection.fromPosition(
                                        TextPosition(
                                          offset:
                                              barcodeProvider.barcode.length,
                                        ),
                                      ),
                                decoration: const InputDecoration(
                                  prefixIcon: Icon(
                                    Icons.find_in_page_rounded,
                                    color: Colors.tealAccent,
                                  ),
                                ),
                                style: const TextStyle(color: Colors.white),
                                onChanged: (val) {
                                  barcodeProvider.setBarcode(val);
                                },
                                onSubmitted: (code) {
                                  productProvider.getProductDetail(
                                    settingProvider.host,
                                    code,
                                  );
                                },
                              );
                            },
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          flex: 1,
                          child: ElevatedButton(
                            onPressed: () async {
                              String? barCode =
                                  await SimpleBarcodeScanner.scanBarcode(
                                    context,
                                    barcodeAppBar: const BarcodeAppBar(
                                      appBarTitle: 'Barcode Scanner',
                                      centerTitle: false,
                                      enableBackButton: true,
                                      backButtonIcon: Icon(
                                        Icons.arrow_back_ios,
                                      ),
                                    ),
                                    isShowFlashIcon: true,
                                    delayMillis: 500,
                                    cameraFace: CameraFace.back,
                                    scanFormat: ScanFormat.ONLY_BARCODE,
                                  );

                              if (!mounted || barCode == null) return;

                              _controller.text = barCode;
                              barcodeProvider.setBarcode(barCode);
                              productProvider.getProductDetail(
                                settingProvider.host,
                                barCode,
                              );
                            },
                            child: const Text("Scan"),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        Expanded(
                          flex: 3,
                          child: ElevatedButton(
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.orange[400],
                              foregroundColor: Colors.black,
                              textStyle: const TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.bold,
                              ),
                              padding: const EdgeInsets.symmetric(vertical: 16),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                            ),
                            onPressed: () {
                              Navigator.of(context).push(
                                MaterialPageRoute<void>(
                                  builder: (context) =>
                                      // TakePictureScreen(camera: widget.camera),
                                      TakePictureScreen(camera: widget.camera),
                                ),
                              );
                            },
                            child: const Text("Deep Search"),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          flex: 1,
                          child: ElevatedButton(
                            onPressed: () {
                              productProvider.getProductsList(
                                settingProvider.host,
                              );
                            },
                            child: const Text("All"),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
