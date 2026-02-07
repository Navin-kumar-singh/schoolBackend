// import mongoose from "mongoose";

// const nearbySchema = new mongoose.Schema({
//   udise_code: String,
//   nearby_udise_code: String,
//   distance_km: Number,
//   preferred: String,
// });

// export default mongoose.model("NearbySchool", nearbySchema);



import mongoose from "mongoose";
import School from "./school.model.js";

const schema = new mongoose.Schema({
  udise_code: String,
  nearby_udise_code: String,
  distance_km: Number,
  preferred: { type: String, default: "no" },
});

export default mongoose.model("NearbySchool", schema);
