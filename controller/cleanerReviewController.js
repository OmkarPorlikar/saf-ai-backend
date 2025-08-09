import express from "express";
import prisma from "../config/prismaClient.mjs";
import multer from "multer";

export async function getCleanerReview(req, res) {
  console.log("request made");

  const { cleaner_user_id } = req.query;

  try {
    const whereClause = cleaner_user_id
      ? { cleaner_user_id: BigInt(cleaner_user_id) }
      : {};

    const reviews = await prisma.cleaner_review.findMany({
      where: whereClause,
    });

    const serialized = reviews.map((r) => {
      const safeReview = {};
      for (const [key, value] of Object.entries(r)) {
        safeReview[key] = typeof value === "bigint" ? value.toString() : value;
      }
      return safeReview;
    });

    res.json(serialized);
  } catch (err) {
    console.error("Fetch Cleaner Reviews Error:", err);
    res.status(500).json({
      error: "Failed to fetch cleaner reviews",
      detail: {
        message: err.message,
        name: err.name,
        stack: err.stack,
      },
    });
  }
}

export const getCleanerReviewsById = async (req, res) => {
  console.log("here");
  const { cleaner_user_id } = req.params;
  try {
    const reviews = await prisma.cleaner_review.findMany({
      where: {
        cleaner_user_id: BigInt(cleaner_user_id),
      },
    });

    const serialized = reviews.map((r) => {
      const safeReview = {};
      for (const [key, value] of Object.entries(r)) {
        safeReview[key] = typeof value === "bigint" ? value.toString() : value;
      }
      return safeReview;
    });

    res.json(serialized);
  } catch (err) {
    console.error("Fetch Reviews by ID Error:", err);
    res.status(500).json({
      error: "Failed to fetch cleaner reviews by ID",
      detail: err,
    });
  }
};
// POST a new review
// export  async function createCleanerReview  (req, res)  {
//   try {
//     const {
//       name,
//       phone,
//       site_id,
//       remarks,
//       latitude,
//       longitude,
//       address,
//       user_id,
//       task_ids,
//     } = req.body;

//     const parsedTaskIds = Array.isArray(task_ids)
//       ? task_ids.map(Number)
//       : task_ids
//       ? task_ids.split(",").map((id) => Number(id.trim()))
//       : [];

//     const imageFilenames = req.files.map((file) => file.filename);

//     const review = await prisma.cleaner_review.create({
//       data: {
//         name,
//         phone,
//         site_id: BigInt(site_id || 1),
//         user_id: BigInt(user_id || 1),
//         task_id: parsedTaskIds,
//         remarks,
//         latitude: parseFloat(latitude),
//         longitude: parseFloat(longitude),
//         address,
//         images: imageFilenames,
//       },
//     });

//     const serializedReview = {
//       ...review,
//       id: review.id.toString(),
//       site_id: review.site_id.toString(),
//       user_id: review.user_id.toString(),
//       created_at: review.created_at.toISOString(),
//       updated_at: review.updated_at.toISOString(),
//     };

//     res.status(201).json(serializedReview);
//   } catch (err) {
//     console.error("Create Review Error:", err);
//     res.status(400).json({
//       error: "Failed to create review",
//       detail: err,
//     });
//   }
// };

export async function createCleanerReview(req, res) {
  try {
    const {
      name,
      phone,
      site_id,
      remarks,
      latitude,
      longitude,
      address,
      cleaner_user_id,
      task_ids,
    } = req.body;

    console.log(req.body, "request body");
    console.log(req.files, "request files");
    const parsedTaskIds = Array.isArray(task_ids)
      ? task_ids.map(Number)
      : task_ids
      ? task_ids.split(",").map((id) => Number(id.trim()))
      : [];

    const imageFilenames = req.files.map((file) => file.filename);

    // 1. Create review
    const review = await prisma.cleaner_review.create({
      data: {
        name,
        phone,
        site_id: BigInt(site_id || 1),
        remarks,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        address,
        images: imageFilenames,
        cleaner_user_id: BigInt(cleaner_user_id || 1),
        task_id: parsedTaskIds,
      },
    });

    const serializedReview = {
      ...review,
      id: review.id.toString(),
      site_id: review.site_id.toString(),
      cleaner_user_id: review.cleaner_user_id.toString(),
      created_at: review.created_at.toISOString(),
      updated_at: review.updated_at.toISOString(),
    };

    // 2. Simulate model processing for each image
    const hygieneResponses = [];

    for (const filename of imageFilenames) {
      const imageUrl = `http://your-image-host.com/uploads/${filename}`;

      // Simulated model output
      const modelResponse = {
        status: "success",
        score: Math.floor(Math.random() * 41) + 60, // random score between 60-100
        metadata: {},
        timestamp: new Date().toISOString(),
      };

      // Save hygiene score to DB
      const hygieneRecord = await prisma.hygiene_scores.create({
        data: {
          location_id: BigInt(site_id || 1),
          score: modelResponse.score,
          details: modelResponse.metadata,
          image_url: imageUrl,
          inspected_at: new Date(modelResponse.timestamp),
          created_by: BigInt(cleaner_user_id || 1),
        },
      });

      hygieneResponses.push({
        id: hygieneRecord.id.toString(),
        score: hygieneRecord.score,
        image_url: hygieneRecord.image_url,
        inspected_at: hygieneRecord.inspected_at.toISOString(),
        location_id: hygieneRecord.location_id?.toString(),
      });
    }

    // 3. Return response
    res.status(201).json({
      review: serializedReview,
      hygiene_scores: hygieneResponses,
    });
  } catch (err) {
    console.error("Create Review Error:", err);
    res.status(400).json({
      error: "Failed to create review",
      detail: err,
    });
  }
}
