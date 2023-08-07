// const express = require("express");
// const multer = require("multer");
// const path = require("path");
// const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
// const ffmpeg = require("fluent-ffmpeg");
// const cors = require("cors");
// const fs = require("fs");

// const app = express();
// const port = 5000;

// ffmpeg.setFfmpegPath(ffmpegPath);

// app.use(cors());

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "uploads/");
//   },
//   filename: function (req, file, cb) {
//     cb(null, `${Date.now()}-${file.originalname}`);
//   },
// });

// const upload = multer({ storage });

// app.post("/compress", upload.single("video"), (req, res) => {
//   const { filename } = req.file;
//   const outputPath = path.join("compressed/", `${Date.now()}-${filename}.mp4`);

//   ffmpeg(req.file.path)
//     .output(outputPath)
//     .on("end", () => {
//       // Send the compressed video as a response
//       res.sendFile(path.resolve(outputPath), () => {
//         // Cleanup the temporary file after sending the response
//         fs.unlink(outputPath, (err) => {
//           if (err) console.error("Error deleting temporary file:", err);
//         });
//       });
//     })
//     .run();
// });

// app.listen(port, () => {
//   console.log(`Server is running on http://localhost:${port}`);
// });

//-------------------------- avbove code is working dont change it ------------------------------ //

// -------------------------- new working code -------------------------------------//

// const express = require("express");
// const multer = require("multer");
// const path = require("path");
// const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
// const ffmpeg = require("fluent-ffmpeg");
// const cors = require("cors");
// const fs = require("fs");

// const app = express();
// const port = 5000;

// ffmpeg.setFfmpegPath(ffmpegPath);

// app.use(cors());

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "uploads/");
//   },
//   filename: function (req, file, cb) {
//     cb(null, `${Date.now()}-${file.originalname}`);
//   },
// });

// const upload = multer({ storage });

// app.post("/compress", upload.single("video"), (req, res) => {
//   const { filename } = req.file;
//   const outputPath = path.join(
//     __dirname,
//     "compressed",
//     `${Date.now()}-${filename}.mp4`
//   );
//   const outputResolution = "854x480"; // 480p resolution, adjust as needed

//   // Step 1: Resize the video to the desired resolution
//   const resizedPath = path.join(
//     __dirname,
//     "resized",
//     `${Date.now()}-${filename}`
//   );
//   console.log("Input File Path:", req.file.path);
//   console.log("Resized File Path:", resizedPath);

//   ffmpeg(req.file.path)
//     .size(outputResolution)
//     .output(resizedPath)
//     .on("end", () => {
//       console.log("Resized Successfully.");

//       // Step 2: Compress the resized video
//       ffmpeg(resizedPath)
//         .output(outputPath)
//         .on("end", () => {
//           console.log("Compressed Successfully.");

//           // Send the compressed video as a response
//           res.sendFile(outputPath, () => {
//             // Cleanup the temporary files after sending the response
//             fs.unlink(outputPath, (err) => {
//               if (err) console.error("Error deleting temporary file:", err);
//             });
//             fs.unlink(resizedPath, (err) => {
//               if (err) console.error("Error deleting temporary file:", err);
//             });
//           });
//         })
//         .on("error", (err) => {
//           console.error("Error compressing video:", err);
//           res.status(500).send("Error compressing video.");
//         })
//         .run();
//     })
//     .on("error", (err) => {
//       console.error("Error resizing video:", err);
//       res.status(500).send("Error resizing video.");
//     })
//     .run();
// });

// app.listen(port, () => {
//   console.log(`Server is running on http://localhost:${port}`);
// });

//------------------------------- code that clean upload file ----------------------- //

// const express = require("express");
// const multer = require("multer");
// const path = require("path");
// const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
// const ffmpeg = require("fluent-ffmpeg");
// const ffprobe = require("@ffprobe-installer/ffprobe");
// const cors = require("cors");
// const fs = require("fs");

// const app = express();
// const port = 5000;

// ffmpeg.setFfmpegPath(ffmpegPath);

// app.use(cors());

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "uploads/");
//   },
//   filename: function (req, file, cb) {
//     cb(null, `${Date.now()}-${file.originalname}`);
//   },
// });

// const upload = multer({ storage });

// // app.post("/compress", upload.single("video"), (req, res) => {
// //   const { filename } = req.file;
// //   const outputPath = path.join(
// //     __dirname,
// //     "compressed",
// //     `${Date.now()}-${filename}.mp4`
// //   );
// //   const outputResolution = "854x480"; // 480p resolution, adjust as needed

// //   // Step 1: Resize the video to the desired resolution
// //   const resizedPath = path.join(
// //     __dirname,
// //     "resized",
// //     `${Date.now()}-${filename}`
// //   );

// //   ffmpeg(req.file.path)
// //     .size(outputResolution)
// //     .output(resizedPath)
// //     .on("end", () => {
// //       // Step 2: Compress the resized video
// //       ffmpeg(resizedPath)
// //         .output(outputPath)
// //         .on("end", () => {
// //           // Send the compressed video as a response
// //           res.sendFile(outputPath, () => {
// //             // Cleanup the temporary files after sending the response
// //             cleanupTempFiles(req.file.path, outputPath, resizedPath);
// //           });
// //         })
// //         .on("error", (err) => {
// //           console.error("Error compressing video:", err);
// //           res.status(500).send("Error compressing video.");
// //         })
// //         .run();
// //     })
// //     .on("error", (err) => {
// //       console.error("Error resizing video:", err);
// //       res.status(500).send("Error resizing video.");
// //     })
// //     .run();
// // });

// // Route for downloading the compressed video

// app.post("/compress", upload.single("video"), async (req, res) => {
//   const { filename } = req.file;

//   // Define the paths for the compressed video, resized video, and thumbnail
//   const outputPath = path.join(
//     __dirname,
//     "compressed",
//     `${Date.now()}-${filename}.mp4`
//   );
//   const resizedPath = path.join(
//     __dirname,
//     "resized",
//     `${Date.now()}-${filename}`
//   );
//   const thumbnailPath = path.join(
//     __dirname,
//     "thumbnails",
//     `${Date.now()}-${filename.replace(".mp4", "")}.jpg`
//   );

//   // Define the output resolution for the compressed video
//   const outputResolution = "854x480"; // 480p resolution, adjust as needed
//   // Step 1: Compress the video
//   await new Promise((resolve, reject) => {
//     ffmpeg(req.file.path)
//       .output(outputPath)
//       .on("end", resolve)
//       .on("error", reject)
//       .run();
//   })
//     .then(() => {
//       // Step 2: Resize the compressed video
//       return new Promise((resolve, reject) => {
//         ffmpeg(outputPath)
//           .size(outputResolution)
//           .output(resizedPath) // Use resizedPath as the output path for resized video
//           .on("end", resolve)
//           .on("error", reject)
//           .run();
//       });
//     })
//     .then(() => {
//       // Step 3: Extract the first frame of the resized video and save as a thumbnail
//       return new Promise((resolve, reject) => {
//         ffmpeg(resizedPath)
//           .screenshots({
//             count: 1,
//             filename: `${Date.now()}-${filename.replace(".mp4", "")}`,
//             folder: "thumbnails",
//           })
//           .output(thumbnailPath)
//           .on("end", resolve)
//           .on("error", reject)
//           .run();
//       });
//     })
//     .then(() => {
//       // Thumbnail creation completed, send the success response
//       res.send(
//         "Video compression and thumbnail generation completed successfully."
//       );

//       // Add a 5-second timeout before calling the cleanupTempFiles function
//       setTimeout(() => {
//         cleanupTempFiles(req.file.path, outputPath, resizedPath, thumbnailPath);
//       }, 5000); // 5000 milliseconds = 5 seconds
//     })
//     .catch((err) => {
//       console.error("Error processing video:", err);
//       res.status(500).send("Error processing video.");
//     });
// });

// // app.get("/download/:filename", (req, res) => {
// //   const { filename } = req.params;
// //   const downloadPath = path.join(__dirname, "compressed", filename);
// //   res.download(downloadPath, (err) => {
// //     if (err) {
// //       console.error("Error downloading file:", err);
// //       res.status(500).send("Error downloading file.");
// //     } else {
// //       // File download successful, cleanup temporary files
// //       const resizedPath = path.join(
// //         __dirname,
// //         "resized",
// //         filename.replace(".mp4", "")
// //       );
// //       cleanupTempFiles(downloadPath, resizedPath);
// //     }
// //   });
// // });

// // function cleanupTempFiles(...paths) {
// //   paths.forEach((path) => {
// //     fs.unlink(path, (err) => {
// //       if (err) console.error("Error deleting temporary file:", err);
// //     });
// //   });
// // }

// app.get("/download/:filename", (req, res) => {
//   const { filename } = req.params;
//   const downloadPath = path.join(__dirname, "compressed", filename);
//   res.download(downloadPath, (err) => {
//     if (err) {
//       console.error("Error downloading file:", err);
//       res.status(500).send("Error downloading file.");
//     }
//   });
// });

// function cleanupTempFiles(...paths) {
//   paths.forEach((path) => {
//     fs.unlink(path, (err) => {
//       if (err) {
//         if (err.code === "ENOENT") {
//           console.error("File not found:", path);
//         } else {
//           console.error("Error deleting temporary file:", err);
//         }
//       }
//     });
//   });
// }

// app.listen(port, () => {
//   console.log(`Server is running on http://localhost:${port}`);
// });

// // --------------------------------- Thumbnail generation code ---------------------------------- //

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
const port = 5000;

ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobe.path); // Set the path for ffprobe

app.use(cors());

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

    //--------- h264  compression --------- //

    // await new Promise((resolve, reject) => {
    //   ffmpeg(req.file.path)
    //     .size(outputResolution)
    //     .output(resizedPath)
    //     .on("end", resolve)
    //     .on("error", (err) => {
    //       console.error("Error resizing video:", err);
    //       reject(err);
    //     })
    //     .run();
    // });

    //-------- h265 compression ---------- //

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

    //------ h264  compression --------- //

    // await new Promise((resolve, reject) => {
    //   ffmpeg(resizedPath)
    //     .output(outputPath)
    //     .on("end", resolve)
    //     .on("error", (err) => {
    //       console.error("Error compressing video:", err);
    //       reject(err);
    //     })
    //     .run();
    // });

    //-------------- h265 compression --------- //

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

    //---------- h264 thumbnail extraction  ---------- //

    // await new Promise((resolve, reject) => {
    //   ffmpeg(req.file.path)
    //     .outputOptions("-vframes", "1") // Extract only 1 frame
    //     .outputOptions("-vf", `scale=${outputResolution}`)
    //     .outputOptions("-c:v", "libx265") // Use H.265 (HEVC) codec
    //     .output(thumbnailPath)
    //     .on("end", resolve)
    //     .on("error", reject)
    //     .run();
    // });

    //---------- h265 thumbnail extraction  ---------- //

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
    res.send(
      "Video compression and thumbnail generation completed successfully."
    );

    // Perform cleanup

    cleanupTempFiles(req.file.path, resizedPath, outputPath, thumbnailPath);

    //----- error catch --- //
  } catch (err) {
    console.error("Error processing video:", err);
    res.status(500).send("Error processing video. Please try again later.");
  }
});

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
