import express from "express";
import multer from "multer";

import {
  getCleanerReview,
  getCleanerReviewsById,
  createCleanerReview,
} from "../controller/cleanerReviewController.js";
const clean_review_Router = express.Router();

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = file.originalname.split(".").pop();
    cb(null, `${file.fieldname}-${uniqueSuffix}.${ext}`);
  },
});
const upload = multer({ storage });

// Routes
clean_review_Router.get("/", getCleanerReview); // optional ?cleaner_user_id
clean_review_Router.get("/:cleaner_user_id", getCleanerReviewsById);
clean_review_Router.post("/", upload.array("images", 5), createCleanerReview);

export default clean_review_Router;
