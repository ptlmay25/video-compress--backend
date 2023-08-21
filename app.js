// // --------------------------------- Video compress & Thumbnail generation code ---------------------------------- //
require("dotenv").config(); // Import and configure dotenv
const express = require("express");
const multer = require("multer");
const path = require("path");
const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const ffmpeg = require("fluent-ffmpeg");
const ffprobe = require("@ffprobe-installer/ffprobe");
const cors = require("cors");
const fs = require("fs").promises; // Use fs.promises for consistent usage
const { v4: uuidv4 } = require("uuid");

const app = express();
const port = process.env.PORT || 5000;

ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobe.path); // Set the path for ffprobe

app.use(cors());
// app.use(express.static("dist"));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    // Sanitize the file name to avoid any potential security issues
    const sanitizedFileName = `${Date.now()}-${file.originalname.replace(
      /[^a-zA-Z0-9-.]/g,
      "_"
    )}`;
    cb(null, sanitizedFileName);
  },
});

const upload = multer({ storage });

app.post("/compress", upload.single("video"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send("No video file uploaded.");
    }

    const { filename } = req.file;
    const uniqueIdentifier = uuidv4();

    // Define the paths for the resized video, compressed video, and thumbnail
    const resizedPath = path.join(
      __dirname,
      "resized",
      `${uniqueIdentifier}-${filename}`
    );
    const outputPath = path.join(
      __dirname,
      "compressed",
      `${uniqueIdentifier}-${filename.replace(path.extname(filename), "")}.mp4`
    );
    const thumbnailPath = path.join(
      __dirname,
      "thumbnails",
      `${uniqueIdentifier}-${filename.replace(path.extname(filename), "")}.jpg`
    );

    // Define the output resolution for the resized video

    const outputResolution = "854x480"; // 480p resolution,
    // const outputResolution = "1280x720"; // 720p resolution,
    // const outputResolution = "1920x1080"; // 1080p resolution,

    // Step 1: Resize the video to the desired resolution (480p)

    //--------- h265  compression --------- //

    await new Promise((resolve, reject) => {
      ffmpeg(req.file.path)
        .size(outputResolution)
        .videoCodec("libx265") // Use H.265 (HEVC) codec
        .output(resizedPath)
        .on("end", resolve)
        .on("error", (err) => {
          console.error("Error resizing video:", err);
          reject(err);
        })
        .run();
    });

    // Step 2: Compress the resized video

    //------ h265  compression --------- //

    await new Promise((resolve, reject) => {
      ffmpeg(resizedPath)
        .output(outputPath)
        .outputOptions("-c:v", "libx265") // Use H.265 (HEVC) codec
        .on("end", resolve)
        .on("error", (err) => {
          console.error("Error compressing video:", err);
          reject(err);
        })
        .run();
    });

    // Step 3: Extract the first frame of the compressed video and save as a thumbnail

    //---------- h264-265 thumbnail extraction  ---------- //

    await new Promise((resolve, reject) => {
      ffmpeg(resizedPath)
        .outputOptions("-vframes", "1") // Extract only 1 frame
        .outputOptions("-vf", `scale=${outputResolution}`)
        .output(thumbnailPath)
        .on("end", resolve)
        .on("error", (err) => {
          console.error("Error creating thumbnail:", err);
          reject(err);
        })
        .run();
    });

    // Thumbnail creation completed, send the success response
    res.send("Product successfully added.");

    // ------------- Delete upload file  -------------- //

    cleanupTempFiles(req.file.path, resizedPath, outputPath, thumbnailPath);

    //----- error catch --- //
  } catch (err) {
    console.error("Error processing video:", err);
    res.status(500).send("Error processing video. Please try again later.");
  }
});

// ----------------------------- delete upload / temporary video file --------------- //

async function cleanupTempFiles(...paths) {
  try {
    const deletePromises = paths.map((path) => fs.unlink(path));

    await Promise.all(deletePromises);
    console.log("Temporary files deleted successfully.");
  } catch (err) {
    console.error("Error deleting temporary files:", err);
    // You can decide whether to throw the error further or handle it here.
  }
}

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
