import express from "express";
// import getRouter from "./routes/routes.js";
import getLocationRoutes from "./routes/LocationRoutes.js";
import cors from "cors";
import location_types_router from "./routes/locationTypes.js";
import configRouter from "./routes/configRoutes.js";
// import clean_review_Router from "./routes/CleanerReviewRoutes.js";
import clean_review_Router from "./routes/CleanerReviewRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import loginRoute from "./routes/loginApi.js";
const app = express();

app.use(express.json());

app.use(cors());

app.use("/api", getLocationRoutes);
app.use("/api", location_types_router);
app.use("/api", configRouter);
app.use("/api/", loginRoute);
app.use("/api/cleaner-reviews", clean_review_Router);
app.use("/uploads", express.static("uploads"));
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')))
app.use("/api/reviews", reviewRoutes);

app.get("/", (req, res) => {
  res.send("Hi there, Your server has successfully started");
});

app.listen(8000, () => {
  console.log("Your server started at port 8000");
});
