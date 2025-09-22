import mongoose from "mongoose";
import Quiz from "./models/quiz.model.js";
import { connectDB } from "./config/db.js";

// Simple test script to create a quiz linked to the lesson
const createTestQuiz = async () => {
  try {
    await connectDB();
    console.log("Connected to database");

    // First, let's see what quizzes exist
    const existingQuizzes = await Quiz.find({});
    console.log("Existing quizzes:", existingQuizzes.length);
    
    existingQuizzes.forEach(quiz => {
      console.log(`Quiz: ${quiz.title}, ID: ${quiz._id}, QuizID: ${quiz.quizId}, LessonID: ${quiz.lessonId}, Module: ${quiz.module}`);
    });

    // Update the existing quiz to have the correct lessonId
    const fireManagementQuiz = await Quiz.findOne({ quizId: "fire-management" });
    
    if (fireManagementQuiz) {
      console.log("Found fire management quiz:", fireManagementQuiz._id);
      
      // Update it to have the correct lessonId
      await Quiz.findByIdAndUpdate(fireManagementQuiz._id, {
        lessonId: "fire-disaster-introduction"
      });
      
      console.log("Updated quiz with lessonId: fire-disaster-introduction");
      
      // Verify the update
      const updatedQuiz = await Quiz.findById(fireManagementQuiz._id);
      console.log("Updated quiz:", {
        title: updatedQuiz.title,
        _id: updatedQuiz._id,
        quizId: updatedQuiz.quizId,
        lessonId: updatedQuiz.lessonId,
        questionsCount: updatedQuiz.questions.length
      });
    } else {
      console.log("Fire management quiz not found, creating new one...");
      
      // Create a new quiz linked to the lesson
      const newQuiz = await Quiz.create({
        title: "Fire Disaster Management Quiz",
        quizId: "fire-disaster-quiz",
        description: "Test your knowledge of fire disaster management",
        lessonId: "fire-disaster-introduction", // Link to the lesson
        createdBy: new mongoose.Types.ObjectId("68ccbbce64702b7ba5cb9083"), // Using admin ID from your response
        questions: [
          {
            text: "What would you do after getting on fire?",
            options: ["Run", "Stop, Drop, and Roll"],
            correctOption: 1,
            points: 1
          },
          {
            text: "What is the first thing to do in case of a fire?",
            options: ["Call emergency services", "Try to put it out yourself", "Run away"],
            correctOption: 0,
            points: 1
          }
        ]
      });
      
      console.log("Created new quiz:", newQuiz._id);
    }

    console.log("Quiz setup completed successfully");
    process.exit(0);
    
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
};

createTestQuiz();