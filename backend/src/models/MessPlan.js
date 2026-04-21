import mongoose from "mongoose";

const MessPlanSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  durationInDays: {
    type: Number,
    required: true
  },
  meals: {
    breakfast: {
      type: Boolean,
      default: false,
    },
    lunch: {
      type: Boolean,
      default: false,
    },
    snacks: {
      type: Boolean,
      default: false,
    },
    dinner: {
      type: Boolean,
      default: false,
    },
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  }
}, { timestamps: true });

export default mongoose.model("MessPlan", MessPlanSchema);