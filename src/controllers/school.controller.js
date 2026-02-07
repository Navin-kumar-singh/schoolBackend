// import School from "../models/school.model.js";
// import NearbySchool from "../models/nearby.model.js";

// export const getSchoolWithNearby = async (req, res) => {
//   try {
//     const { udise } = req.params;

//     // main school
//     const school = await School.findOne({ udise_code: udise });

//     if (!school) {
//       return res.status(404).json({ message: "School not found" });
//     }

//     // mappings
//     const mappings = await NearbySchool.find({ udise_code: udise });

//     // fetch details
//     const nearby = await Promise.all(
//       mappings.map(async (m) => {
//         const nearSchool = await School.findOne({
//           udise_code: m.nearby_udise_code,
//         });

//         if (!nearSchool) return null;

//         return {
//           udise_code: nearSchool.udise_code,
//           school_name: nearSchool.school_name,
//           mobile: nearSchool.mobile,
//           pincode: nearSchool.pincode,
//           location_url: nearSchool.location_url,
//           distance_km: m.distance_km,
//           preferred: m.preferred,
//         };
//       })
//     );

//     res.json({
//       school,
//       nearby: nearby.filter(Boolean),
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };





import School from "../models/school.model.js";
import Nearby from "../models/nearby.model.js";

export const searchSchool = async (req, res) => {
  try {
    const { udise } = req.params;

    const school = await School.findOne({ udise_code: udise });
    if (!school) return res.status(404).json({ message: "Not found" });

    const mappings = await Nearby.find({ udise_code: udise });

    const nearby = await Promise.all(
      mappings.map(async (m) => {
        const s = await School.findOne({
          udise_code: m.nearby_udise_code,
        });

        if (!s) return null;

        return {
          udise_code: s.udise_code,
          school_name: s.school_name,
          mobile: s.mobile,
          pincode: s.pincode,
          location_url: s.location_url,
          distance_km: m.distance_km,
          preferred: m.preferred,
        };
      })
    );

    res.json({ school, nearby: nearby.filter(Boolean) });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const markPreferred = async (req, res) => {
  const { udise, nearby } = req.body;

  await Nearby.findOneAndUpdate(
    { udise_code: udise, nearby_udise_code: nearby },
    { preferred: "yes" }
  );

  res.json({ message: "Updated" });
};
