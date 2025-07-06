import mongoose from "mongoose";

const canvaSchema = new mongoose.Schema(
  {
    field: {
      type: [[String]], // 2D array of color codes
      required: true,
    },
    fieldWidth: { type: Number, required: true },
    fieldHeight: { type: Number, required: true },
  },
  { timestamps: true }
);

const Canva = mongoose.model("Canva", canvaSchema);

export default Canva;
