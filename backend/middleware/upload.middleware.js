import multer from "multer";

const storage = multer.memoryStorage();

export const uploadCSV = multer({
  storage,

  limits: {
    fileSize: 2 * 1024 * 1024,
    files: 1,
  },

  fileFilter: (req, file, cb) => {
    const isCSV = file.originalname
      .toLowerCase()
      .endsWith(".csv");

    if (!isCSV) {
      const error = new Error(
        "Only CSV files are allowed"
      );

      error.statusCode = 400;

      return cb(error);
    }

    cb(null, true);
  },
});