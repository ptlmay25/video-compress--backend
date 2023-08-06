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

const express = require("express");
const multer = require("multer");
const path = require("path");
const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const ffmpeg = require("fluent-ffmpeg");
const cors = require("cors");
const fs = require("fs");

const app = express();
const port = 5000;

ffmpeg.setFfmpegPath(ffmpegPath);

app.use(cors());

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

app.post("/compress", upload.single("video"), (req, res) => {
  const { filename } = req.file;
  const outputPath = path.join(
    __dirname,
    "compressed",
    `${Date.now()}-${filename}.mp4`
  );
  const outputResolution = "854x480"; // 480p resolution, adjust as needed

  // Step 1: Resize the video to the desired resolution
  const resizedPath = path.join(
    __dirname,
    "resized",
    `${Date.now()}-${filename}`
  );

  ffmpeg(req.file.path)
    .size(outputResolution)
    .output(resizedPath)
    .on("end", () => {
      // Step 2: Compress the resized video
      ffmpeg(resizedPath)
        .output(outputPath)
        .on("end", () => {
          // Send the compressed video as a response
          res.sendFile(outputPath, () => {
            // Cleanup the temporary files after sending the response
            cleanupTempFiles(req.file.path, outputPath, resizedPath);
          });
        })
        .on("error", (err) => {
          console.error("Error compressing video:", err);
          res.status(500).send("Error compressing video.");
        })
        .run();
    })
    .on("error", (err) => {
      console.error("Error resizing video:", err);
      res.status(500).send("Error resizing video.");
    })
    .run();
});

// Route for downloading the compressed video
app.get("/download/:filename", (req, res) => {
  const { filename } = req.params;
  const downloadPath = path.join(__dirname, "compressed", filename);
  res.download(downloadPath, (err) => {
    if (err) {
      console.error("Error downloading file:", err);
      res.status(500).send("Error downloading file.");
    } else {
      // File download successful, cleanup temporary files
      const resizedPath = path.join(
        __dirname,
        "resized",
        filename.replace(".mp4", "")
      );
      cleanupTempFiles(downloadPath, resizedPath);
    }
  });
});

function cleanupTempFiles(...paths) {
  paths.forEach((path) => {
    fs.unlink(path, (err) => {
      if (err) console.error("Error deleting temporary file:", err);
    });
  });
}

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

// --------------------------------- Thumbnail generation code ---------------------------------- //
