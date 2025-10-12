class Product {
  final String? productCode;
  final String? productName;
  final String? description;
  final double? price;
  final int? quantity;
  final String? category;
  final String? imageUrl;
  final String? unit;
  final String? shelf;

  Product({
    this.productCode,
    this.productName,
    this.description,
    this.price,
    this.quantity,
    this.category,
    this.imageUrl,
    this.unit,
    this.shelf,
  });

  factory Product.fromListJson(Map<String, dynamic> json) {
    return Product(
      productCode: json['product_code'],
      productName: json['product_name'],
      imageUrl: json['image_url'],
    );
  }

  factory Product.fromDetailJson(Map<String, dynamic> json) {
    return Product(
      productCode: json['product_code'],
      productName: json['product_name'],
      description: json['description'],
      price: (json['price'] as num).toDouble(),
      quantity: json['quantity'],
      category: json['category'],
      imageUrl: json['image_url'],
      unit: json['unit'],
      shelf: json['shelf'],
    );
  }
}
