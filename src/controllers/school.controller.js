import School from "../models/school.model.js";
import Nearby from "../models/nearby.model.js";


// 🎯 1. Get Districts
export const getDistricts = async (req, res) => {
  try {
    const districts = await School.distinct("district");
    res.json(districts.sort());
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};


// 🎯 2. Get Schools by District
export const getSchoolsByDistrict = async (req, res) => {
  try {
    const { district } = req.params;

    const schools = await School.find({ district }).select(
      " school_name udise_code district pincode map_link map_link"
    );

    res.json(schools);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};


// 🎯 3. Get Single School + Nearby
export const getSchoolWithNearby = async (req, res) => {
  try {
    const { udise } = req.params;

    const school = await School.findOne({ udise_code: udise });
    if (!school) return res.status(404).json({ message: "School not found" });

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

    res.json({
      school,
      nearby: nearby.filter(Boolean),
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};


// 🎯 4. Mark Preferred
export const markPreferred = async (req, res) => {
  try {
    const { udise, nearby } = req.body;

    await Nearby.findOneAndUpdate(
      { udise_code: udise, nearby_udise_code: nearby },
      { preferred: "yes" }
    );

    res.json({ message: "Preferred updated" });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};
