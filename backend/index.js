import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import quizRoutes from "./routes/quiz.routes.js";
import lessonRoutes from "./routes/lessons.route.js";
import applicationRoutes from "./routes/application.route.js";
import moduleRoutes from "./routes/modules.route.js";
import postRoutes from "./routes/posts.route.js";
import virtualdrillRoutes from "./routes/virtualdrill.route.js";
import "dotenv/config";



const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();


app.use(
  cors({
    origin: "http://localhost:5173", // your frontend URL
    credentials: true,              // allow cookies/auth headers
  })
);

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/api/lessons", lessonRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/modules", moduleRoutes); // Assuming modules are handled in lessonRoutes
app.use("/api/posts",postRoutes);
app.use("/api/virtualdrills", virtualdrillRoutes);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
