const express = require("express");
const multer = require("multer");
const zlib = require("node:zlib");
const { promisify } = require("node:util");
const gzipAsync = promisify(zlib.gzip);

const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1 mb
const PORT = 3000;
const ERROR_UPLOAD_IMAGE_REQUIRED = "Please upload an image file";
const ERROR_ONLY_IMAGE_ALLOWED = "Only image files are allowed";
const ERROR_IMAGE_TOO_LARGE = "Image size exceeded (max 1MB)";
const ERROR_COMPRESS_FAILED = "Failed to compress image";
const ERROR_INVALID_UPLOAD = "Invalid image upload request";
const ERROR_UNEXPECTED_SERVER = "Unexpected server error";

//configuration
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: MAX_FILE_SIZE
    }
});

const app = express();
const history = [];


//middleware functions
function createHttpError(status, message) {
    const error = new Error(message);
    error.status = status;
    return error;
}

function imageUploadMiddleware(req, res, next) {
    upload.single("image")(req, res, (error) => {
        if (!error) {
            return next();
        }

        if (error.code === "LIMIT_FILE_SIZE") {
            return next(createHttpError(400, ERROR_IMAGE_TOO_LARGE));
        }

        return next(createHttpError(400, ERROR_INVALID_UPLOAD));
    });
}

function imageValidationMiddleware(req, res, next) {
    try {
        if (!req.file) {
            throw createHttpError(400, ERROR_UPLOAD_IMAGE_REQUIRED);
        }

        if (!req.file.mimetype || !req.file.mimetype.startsWith("image/")) {
            throw createHttpError(400, ERROR_ONLY_IMAGE_ALLOWED);
        }

        return next();
    } catch (error) {
        return next(error);
    }
}

//API routes
app.post("/api/images/compress", imageUploadMiddleware, imageValidationMiddleware, async (req, res, next) => {
    try {
        //further improvement: consider splite the upload stage and compress stage for better scalability and performance.
        const compressed = await gzipAsync(req.file.buffer);

        const {originalname, mimetype, buffer} = req.file;
        const record = {
            filename: originalname,
            contentType: mimetype,
            originalSize: buffer.length,
            compressedSize: compressed.length,
            uploadedAt: new Date().toISOString(),
        };
        history.push(record);

        res.type("application/gzip");
        return res.status(200).send(compressed);
    } catch (error) {
        return next(createHttpError(500, ERROR_COMPRESS_FAILED));
    }
});

app.get("/api/images/history", (req, res) => {
    return res.json({history});
});

//error handling middleware
app.use((error, req, res, next) => {
    if (error && error.status) {
        return res.status(error.status).json({ error: error.message });
    }
    return res.status(500).json({ error: ERROR_UNEXPECTED_SERVER });
});

//start server
app.listen(PORT, () => {
    console.log(`Server on port ${PORT}`);
});
