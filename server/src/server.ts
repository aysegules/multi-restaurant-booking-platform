import "dotenv/config";
import app from "./app";

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

const shutdown = (exitCode: number | string) => {
  console.log("Shutting down gracefully...");

  server.close(() => {
    process.exit(exitCode);
  });
};

process.on("SIGTERM", () => shutdown(0));
process.on("SIGINT", () => shutdown(0));

process.on("unhandledRejection", (error) => {
  console.error("Unhandled Rejection:", error);
  shutdown(1);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  shutdown(1);
});
