import 'package:demo_product_search/components/widgets/product_detail.dart';
import 'package:demo_product_search/components/widgets/product_list.dart';
import 'package:demo_product_search/provider/barcode_provider.dart';
import 'package:demo_product_search/provider/product_provider.dart';
import 'package:flutter/material.dart';
import 'package:marquee/marquee.dart';
import 'package:provider/provider.dart';

class ProductScreen extends StatelessWidget {
  const ProductScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Consumer<ProductProvider>(
      builder: (c, provider, child) {
        return Flexible(
          child: Container(
            color: Colors.grey[700],
            padding: const EdgeInsets.all(16),
            child: Builder(
              builder: (ctx) {
                final barcodeProvider = ctx.read<BarcodeProvider>();

                switch (provider.status) {
                  case ScreenStatus.loading:
                    return const Center(
                      child: CircularProgressIndicator(color: Colors.white),
                    );

                  case ScreenStatus.error:
                    return Center(
                      child: Text(
                        provider.errorMessage,
                        style: const TextStyle(color: Colors.white),
                      ),
                    );

                  case ScreenStatus.success:
                    if (provider.selectedProduct != null) {
                      final product = provider.selectedProduct!;
                      return ProductDetailWidget(product: product);
                    } else if (provider.products.isNotEmpty) {
                      return ProductListWidget(
                        barcodeProvider: barcodeProvider,
                        provider: provider,
                      );
                    } else {
                      return const Center(
                        child: Text(
                          'No Product Found',
                          style: TextStyle(color: Colors.white, fontSize: 24),
                        ),
                      );
                    }

                  case ScreenStatus.initial:
                    // return const Center(
                    //   child: Text(
                    //     'No Product Selected',
                    //     style: TextStyle(color: Colors.white),
                    //   ),
                    // );

                    return Center(
                      child: Marquee(
                        text: 'The AI Product Search',
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 34,
                        ),
                        scrollAxis: Axis.horizontal,
                        crossAxisAlignment: CrossAxisAlignment.center,
                        blankSpace: 20.0,
                        velocity: 100.0,
                        pauseAfterRound: Duration(seconds: 1),
                        startPadding: 10.0,
                        accelerationDuration: Duration(seconds: 1),
                        accelerationCurve: Curves.linear,
                        decelerationDuration: Duration(milliseconds: 500),
                        decelerationCurve: Curves.easeOut,
                      ),
                    );
                }
              },
            ),
          ),
        );
      },
    );
  }
}
