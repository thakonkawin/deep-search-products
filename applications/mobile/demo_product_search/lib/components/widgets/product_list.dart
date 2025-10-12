import 'package:cached_network_image/cached_network_image.dart';
import 'package:demo_product_search/provider/barcode_provider.dart';
import 'package:demo_product_search/provider/product_provider.dart';
import 'package:flutter/material.dart';

class ProductListWidget extends StatelessWidget {
  const ProductListWidget({
    super.key,
    required this.barcodeProvider,
    required this.provider,
  });

  final BarcodeProvider barcodeProvider;
  final ProductProvider provider;

  @override
  Widget build(BuildContext context) {
    return ListView.builder(
      itemCount: provider.products.length,
      itemBuilder: (context, index) {
        final p = provider.products[index];
        return Card(
          color: Colors.grey[800],
          child: ListTile(
            leading: ClipRRect(
              borderRadius: BorderRadius.circular(12),
              child: SizedBox(
                width: MediaQuery.of(context).size.width / 5,
                height: MediaQuery.of(context).size.width / 5,
                child: CachedNetworkImage(
                  imageUrl: p.imageUrl!,
                  fit: BoxFit.fill,
                  placeholder: (context, url) => const Center(
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      color: Colors.white,
                    ),
                  ),
                  errorWidget: (context, url, error) => Container(
                    color: Colors.grey[800],
                    child: Icon(
                      Icons.broken_image,
                      color: Colors.red,
                      size: MediaQuery.of(context).size.width * 0.1,
                    ),
                  ),
                ),
              ),
            ),

            title: Text(
              p.productName!,
              style: const TextStyle(color: Colors.white),
            ),
            subtitle: Text(
              "Code: ${p.productCode}",
              style: const TextStyle(color: Colors.white70),
            ),
            onTap: () {
              barcodeProvider.setBarcode(p.productCode!);
            },
          ),
        );
      },
    );
  }
}
