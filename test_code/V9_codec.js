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
const { createClient } = require("@supabase/supabase-js");

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_PROJECT_UserURL,
  process.env.SUPABASE_PROJECT_UserKEY
);

const app = express();
const port = process.env.PORT || 5000;

ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobe.path); // Set the path for ffprobe

app.use(cors());
app.use(express.static("dist"));

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

    const outputResolution = "480x854"; // 480p resolution,
    // const outputResolution = "1280x720"; // 720p resolution,
    // const outputResolution = "1920x1080"; // 1080p resolution,

    // Step 1: Resize the video to the desired resolution (480p)

    //--------- google VP9 codec  compression --------- //

    await new Promise((resolve, reject) => {
      ffmpeg(req.file.path)
        .size(outputResolution)
        .videoCodec("libvpx-vp9") // Use VP9 codec
        .output(resizedPath)
        .on("end", resolve)
        .on("error", (err) => {
          console.error("Error resizing video:", err);
          reject(err);
        })
        .run();
    });

    // Step 2: Compress the resized video

    //------ google VP9 codec  compression --------- //

    await new Promise((resolve, reject) => {
      ffmpeg(resizedPath)
        .output(outputPath)
        .outputOptions("-c:v", "libvpx-vp9") // Use VP9 codec
        .on("end", resolve)
        .on("error", (err) => {
          console.error("Error compressing video:", err);
          reject(err);
        })
        .run();
    });

    // Step 3: Extract the first frame of the compressed video and save as a thumbnail

    //---------- thumbnail extraction  ---------- //

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

    // step 4. Video upload to supababase ------------

    const videoData = await fs.readFile(outputPath);
    const { data, error } = await supabase.storage
      .from("video")
      .upload(
        `${uniqueIdentifier}-${filename.replace(
          path.extname(filename),
          ""
        )}.mp4`,
        videoData
      );
    // console.log(data);

    // step 5. Thumbnail upload to supababase ------------

    const thumbnailData = await fs.readFile(thumbnailPath);
    const { data: tdata, error: terror } = await supabase.storage
      .from("thumbnail")
      .upload(
        `${uniqueIdentifier}-${filename.replace(
          path.extname(filename),
          ""
        )}.jpg`,
        thumbnailData
      );
    // console.log(tdata);

    // step 6. Upload completed, send the success response to frontend

    res.send({ videoid: data, thumbnailid: tdata });

    // step 7. ------------- Delete all upload & compressed files  -------------- //

    cleanupTempFiles(req.file.path, resizedPath, outputPath, thumbnailPath);

    //----- error catch --- //
  } catch (err) {
    console.error("Error processing video:", err);
    res.status(500).send("Error processing video. Please try again later.");
  }
});

// ----------------------------- delete upload / temporary video file function --------------- //

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

//--------------------------------- app running message--------------------------------------//

app.get("/api/user", (req, res) => {
  res.send("hello server is running");
});

//-------------------- port -------------------
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
