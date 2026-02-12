import mongoose from "mongoose";

const schoolSchema = new mongoose.Schema(
  {
    udise_code: { type: String, required: true, unique: true },
    school_name: String,
    district: String,
    pincode: String,
    latitude: Number,
    longitude: Number,
    map_link: String,
    location_url: String,
    mobile: String,
    visited: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("School", schoolSchema);