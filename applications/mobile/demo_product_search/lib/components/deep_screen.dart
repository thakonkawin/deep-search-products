import 'dart:io';
import 'package:demo_product_search/provider/barcode_provider.dart';
import 'package:demo_product_search/provider/deep_provider.dart';
import 'package:demo_product_search/provider/product_provider.dart';
import 'package:demo_product_search/provider/setting_provider.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

class DeepScreen extends StatelessWidget {
  final File imageFile;

  const DeepScreen({super.key, required this.imageFile});

  @override
  Widget build(BuildContext context) {
    final deepProvider = context.read<DeepProvider>();
    final productProvider = context.read<ProductProvider>();
    final barcodeProvider = context.read<BarcodeProvider>();
    final settingProvider = context.read<SettingProvider>();

    return Scaffold(
      appBar: AppBar(title: const Text('Deep Search')),
      body: Center(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.center,
          mainAxisAlignment: MainAxisAlignment.start,
          children: [
            Padding(
              padding: const EdgeInsets.all(18.0),
              child: Image.file(imageFile),
            ),

            SizedBox(height: 20),
            ElevatedButton(
              onPressed: () async {
                deepProvider.getImageVector(settingProvider.host, imageFile);
                showDialog(
                  context: context,
                  barrierDismissible: false,
                  builder: (context) {
                    return Consumer<DeepProvider>(
                      builder: (context, provider, _) {
                        switch (provider.status) {
                          case Status.loading:
                            return AlertDialog(
                              title: const Text('Process'),
                              content: SizedBox(
                                height:
                                    MediaQuery.of(context).size.height * 0.4,
                                width: MediaQuery.of(context).size.width * 0.2,
                                child: Center(
                                  child: CircularProgressIndicator(
                                    color: Colors.white,
                                  ),
                                ),
                              ),
                              actions: [
                                TextButton(
                                  onPressed: () => Navigator.of(context).pop(),
                                  child: const Text('Cancel'),
                                ),
                              ],
                            );

                          case Status.success:
                            return AlertDialog(
                              title: const Text('Result'),
                              content: SizedBox(
                                height:
                                    MediaQuery.of(context).size.height * 0.4,
                                width: MediaQuery.of(context).size.width * 0.2,
                                child: ListView.builder(
                                  itemCount: provider.results.length,
                                  itemBuilder: (context, index) {
                                    return Padding(
                                      padding: const EdgeInsets.symmetric(
                                        vertical: 8.0,
                                      ),
                                      child: InkWell(
                                        onTap: () {
                                          barcodeProvider.setBarcode(
                                            provider.results[index].code,
                                          );

                                          productProvider.getProductDetail(
                                            settingProvider.host,
                                            provider.results[index].code,
                                          );

                                          int count = 0;
                                          Navigator.of(
                                            context,
                                          ).popUntil((_) => count++ >= 3);
                                        },
                                        child: Container(
                                          decoration: BoxDecoration(
                                            border: Border.all(
                                              color: Colors.white,
                                              width: 1.5,
                                            ),
                                            borderRadius: BorderRadius.circular(
                                              12,
                                            ),
                                          ),
                                          child: Padding(
                                            padding: EdgeInsets.symmetric(
                                              vertical: 12,
                                              horizontal: 12,
                                            ),
                                            child: Row(
                                              mainAxisAlignment:
                                                  MainAxisAlignment
                                                      .spaceBetween,
                                              crossAxisAlignment:
                                                  CrossAxisAlignment.center,
                                              children: [
                                                Flexible(
                                                  child: Column(
                                                    mainAxisAlignment:
                                                        MainAxisAlignment.start,
                                                    crossAxisAlignment:
                                                        CrossAxisAlignment
                                                            .start,
                                                    children: [
                                                      Text(
                                                        'Code: ${provider.results[index].code}',
                                                        textAlign:
                                                            TextAlign.start,
                                                        maxLines: 2,
                                                        overflow: TextOverflow
                                                            .ellipsis,
                                                      ),
                                                      Text(
                                                        'similarity: ${provider.results[index].similarity.toStringAsFixed(2)}%',
                                                        textAlign:
                                                            TextAlign.start,
                                                        maxLines: 1,
                                                        overflow: TextOverflow
                                                            .ellipsis,
                                                      ),
                                                    ],
                                                  ),
                                                ),
                                                Icon(
                                                  Icons.fiber_manual_record,
                                                  color: index == 0
                                                      ? Colors.greenAccent
                                                      : index == 1
                                                      ? Colors.yellowAccent
                                                      : Colors.orangeAccent,
                                                ),
                                              ],
                                            ),
                                          ),
                                        ),
                                      ),
                                    );
                                  },
                                ),
                              ),
                              actions: [
                                TextButton(
                                  onPressed: () => Navigator.of(context).pop(),
                                  child: const Text('OK'),
                                ),
                              ],
                            );

                          case Status.error:
                            return AlertDialog(
                              title: const Text('Error'),
                              content: SizedBox(
                                height:
                                    MediaQuery.of(context).size.height * 0.4,
                                width: MediaQuery.of(context).size.width * 0.2,
                                child: Center(
                                  child: Text(
                                    provider.errorMessage,
                                    textAlign: TextAlign.center,
                                  ),
                                ),
                              ),
                              actions: [
                                TextButton(
                                  onPressed: () => Navigator.of(context).pop(),
                                  child: const Text('Close'),
                                ),
                              ],
                            );

                          default:
                            return const SizedBox.shrink();
                        }
                      },
                    );
                  },
                );
              },
              child: const Text("Search"),
            ),
          ],
        ),
      ),
      // floatingActionButton: FloatingActionButton(
      //   onPressed: () async {},
      //   backgroundColor: Colors.tealAccent[400],
      //   child: const Text("Search", style: TextStyle(color: Colors.black)),
      // ),
    );
  }
}
