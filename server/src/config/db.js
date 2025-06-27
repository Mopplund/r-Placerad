import moongoose from "mongoose";

export const connectDB = async () => {
  try {
    await moongoose.connect(process.env.MONGO_URI);
    console.log("Ansluten till databasen");
  } catch (error) {
    console.error("Kunde inte ansluta till databasen:", error);
    process.exit(1);
  }
};
