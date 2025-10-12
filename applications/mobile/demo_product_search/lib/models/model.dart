class ResultDeep {
  final String code;
  final double similarity;

  ResultDeep({required this.code, required this.similarity});

  // factory ResultDeep.fromListJson(Map<String, dynamic> json) {
  //   return ResultDeep(code: json['product_code'], distance: json['distance']);
  // }

  factory ResultDeep.fromJson(Map<String, dynamic> json) {
    return ResultDeep(
      code: json['product_code'],
      similarity: (json['similarity'] as num).toDouble(),
    );
  }
}
