import mongoose from "mongoose";

const nearbySchema = new mongoose.Schema(
  {
    udise_code: String,
    nearby_udise_code: String,
    distance_km: Number,
    preferred: { type: String, default: "no" },
  },
  { timestamps: true }
);

export default mongoose.model("NearbySchool", nearbySchema);