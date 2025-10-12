import 'package:cached_network_image/cached_network_image.dart';
import 'package:demo_product_search/models/product.dart';
import 'package:flutter/material.dart';

class ProductDetailWidget extends StatelessWidget {
  const ProductDetailWidget({super.key, required this.product});

  final Product product;

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      child: Column(
        mainAxisSize: MainAxisSize.max,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          ClipRRect(
            borderRadius: BorderRadius.circular(12),
            child: SizedBox(
              width: double.infinity,
              height: MediaQuery.of(context).size.height * 0.38,
              child:
                  // Image.network(
                  //   product.imageUrl!,
                  //   fit: BoxFit.fill,
                  //   loadingBuilder: (context, child, loadingProgress) {
                  //     if (loadingProgress == null) return child;
                  //     return const Center(
                  //       child: CircularProgressIndicator(
                  //         strokeWidth: 2,
                  //         color: Colors.white,
                  //       ),
                  //     );
                  //   },
                  //   errorBuilder: (context, error, stackTrace) {
                  //     return Container(
                  //       color: Colors.grey[800],
                  //       child: Icon(
                  //         Icons.broken_image,
                  //         color: Colors.red,
                  //         size: MediaQuery.of(context).size.width * 0.5,
                  //       ),
                  //     );
                  //   },
                  // ),
                  CachedNetworkImage(
                    imageUrl: product.imageUrl!,
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
          SizedBox(height: 22),
          Text(
            product.productCode ?? '',
            maxLines: 1,
            style: const TextStyle(color: Colors.white, fontSize: 22),
            overflow: TextOverflow.ellipsis,
          ),
          Text(
            product.productName ?? '',
            maxLines: 1,
            style: const TextStyle(color: Colors.white, fontSize: 20),
            overflow: TextOverflow.ellipsis,
          ),
          Text(
            product.description ?? '',
            maxLines: 2,
            style: const TextStyle(color: Colors.white70, fontSize: 16),
            overflow: TextOverflow.ellipsis,
          ),
          SizedBox(height: 6),
          Text(
            'Price: ${product.price ?? 0} บาท',
            style: const TextStyle(color: Colors.white, fontSize: 16),
          ),
          Text(
            'Category: ${product.category}',
            style: const TextStyle(color: Colors.white, fontSize: 16),
          ),
          SizedBox(height: 6),
          Row(
            mainAxisAlignment: MainAxisAlignment.start,
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                'Quantity: ${product.quantity ?? 0}',
                style: const TextStyle(color: Colors.white, fontSize: 16),
              ),
              Text(
                ' ${product.unit}',
                style: const TextStyle(color: Colors.white, fontSize: 16),
              ),
            ],
          ),
          SizedBox(height: 6),
          Text(
            'Shelf: ${product.shelf ?? ""}',
            style: const TextStyle(color: Colors.white, fontSize: 16),
          ),
        ],
      ),
    );
  }
}
