import 'dart:io';
import 'package:flutter/material.dart';
import 'package:camera/camera.dart';
import 'package:path_provider/path_provider.dart';
import 'deep_screen.dart';
import 'package:image/image.dart' as img;
// import 'package:fc_native_image_resize/fc_native_image_resize.dart';

class TakePictureScreen extends StatefulWidget {
  const TakePictureScreen({super.key, required this.camera});
  final CameraDescription camera;

  @override
  TakePictureScreenState createState() => TakePictureScreenState();
}

class TakePictureScreenState extends State<TakePictureScreen> {
  late CameraController _controller;
  late Future<void> _initializeControllerFuture;

  final double boxWidth = 224;
  final double boxHeight = 224;

  @override
  void initState() {
    super.initState();
    _controller = CameraController(widget.camera, ResolutionPreset.max);
    _initializeControllerFuture = _controller.initialize();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  Future<File> _cropAndResize(File originalImage, Size screenSize) async {
    final imageBytes = await originalImage.readAsBytes();
    final img.Image? capturedImage = img.decodeImage(imageBytes);
    if (capturedImage == null) throw Exception("ไม่สามารถอ่านภาพได้");

    final overlayLeft = (screenSize.width - boxWidth) / 2;
    final overlayTop = (screenSize.height - boxHeight) / 2;

    final scaleX = capturedImage.width / screenSize.width;
    final scaleY = capturedImage.height / screenSize.height;

    final cropX = (overlayLeft * scaleX).round();
    final cropY = (overlayTop * scaleY).round();
    final cropWidth = (boxWidth * scaleX).round();
    final cropHeight = (boxHeight * scaleY).round();

    final img.Image cropped = img.copyCrop(
      capturedImage,
      x: cropX,
      y: cropY,
      width: cropWidth,
      height: cropHeight,
    );

    final tempDir = await getTemporaryDirectory();
    final croppedFile = File(
      '${tempDir.path}/cropped_${DateTime.now().millisecondsSinceEpoch}.jpg',
    );
    await croppedFile.writeAsBytes(img.encodeJpg(cropped));

    // resize ด้วย FcNativeImageResize
    // final resizedFile = File(
    //   '${tempDir.path}/resized_${DateTime.now().millisecondsSinceEpoch}.jpg',
    // );
    // await FcNativeImageResize().resizeFile(
    //   srcFile: croppedFile.path,
    //   destFile: resizedFile.path,
    //   width: 224,
    //   height: 224,
    //   keepAspectRatio: true,
    //   format: 'jpeg',
    //   quality: 100,
    // );

    return croppedFile;
  }

  @override
  Widget build(BuildContext context) {
    final screenSize = MediaQuery.of(context).size;

    return Scaffold(
      appBar: AppBar(title: const Text('Take a product')),
      body: FutureBuilder(
        future: _initializeControllerFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState != ConnectionState.done) {
            return const Center(child: CircularProgressIndicator());
          }
          return Stack(
            fit: StackFit.expand,
            children: [
              CameraPreview(_controller),
              // overlay mask
              ColorFiltered(
                colorFilter: ColorFilter.mode(
                  Colors.black.withAlpha(200),
                  BlendMode.srcOut,
                ),
                child: Stack(
                  fit: StackFit.expand,
                  children: [
                    Container(
                      color: Colors.black,
                      foregroundDecoration: const BoxDecoration(
                        color: Colors.black,
                        backgroundBlendMode: BlendMode.dstOut,
                      ),
                    ),
                    Align(
                      alignment: Alignment.center,
                      child: Container(
                        width: boxWidth,
                        height: boxHeight,
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(8),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              // กรอบสี่เหลี่ยม
              Align(
                alignment: Alignment.center,
                child: Container(
                  width: boxWidth,
                  height: boxHeight,
                  decoration: BoxDecoration(
                    border: Border.all(color: Colors.white, width: 2),
                    borderRadius: BorderRadius.circular(8),
                  ),
                ),
              ),
            ],
          );
        },
      ),
      floatingActionButton: FloatingActionButton(
        backgroundColor: Colors.tealAccent[400],
        child: const Icon(Icons.camera_alt_rounded, color: Colors.black),
        onPressed: () async {
          try {
            await _initializeControllerFuture;
            final image = await _controller.takePicture();
            final processedFile = await _cropAndResize(
              File(image.path),
              screenSize,
            );

            if (!context.mounted) return;
            await Navigator.of(context).push(
              MaterialPageRoute(
                builder: (_) => DeepScreen(imageFile: processedFile),
              ),
            );
          } catch (e) {
            if (context.mounted) {
              ScaffoldMessenger.of(
                context,
              ).showSnackBar(SnackBar(content: Text('เกิดข้อผิดพลาด: $e')));
            }
          }
        },
      ),
    );
  }
}
