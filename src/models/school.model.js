import mongoose from "mongoose";

const schoolSchema = new mongoose.Schema({
  udise_code: { type: String, required: true, unique: true },
  school_name: String,
  district: String,
  pincode: String,
  location_url: String,
  mobile: String,
});

export default mongoose.model("School", schoolSchema);
