import mongoose from "mongoose";

const canvaSchema = new mongoose.Schema(
  {
    field: {
      type: [[String]],
      required: true,
    },
    fieldWidth: { type: Number, required: true },
    fieldHeight: { type: Number, required: true },
  },
  { timestamps: true }
);

const Canva = mongoose.model("Canva", canvaSchema);

export default Canva;
