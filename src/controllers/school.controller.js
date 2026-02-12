import School from "../models/school.model.js";
import Nearby from "../models/nearby.model.js";

// 1. Get all distinct districts
export const getDistricts = async (req, res) => {
  try {
    const districts = await School.distinct("district");
    res.json(districts.sort());
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// 2. Get schools by district – ONLY non-visited
export const getSchoolsByDistrict = async (req, res) => {
  try {
    const { district } = req.params;
    const schools = await School.find({ district, visited: false })
      .select("udise_code school_name district pincode mobile");
    res.json(schools);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// 3. Get single school + nearby schools (nearby list excludes visited)
export const getSchoolWithNearby = async (req, res) => {
  try {
    const { udise } = req.params;
    const trimmedUdise = udise.trim();

    let school = await School.findOne({ udise_code: trimmedUdise });
    if (!school) {
      school = await School.findOne({
        udise_code: { $regex: new RegExp(`^${trimmedUdise}$`, "i") },
      });
    }

    if (!school) {
      console.error(`❌ School not found for UDISE: "${trimmedUdise}"`);
      return res.status(404).json({
        message: "School not found",
        received_udise: trimmedUdise,
      });
    }

    const mappings = await Nearby.find({ udise_code: school.udise_code });

    const nearby = await Promise.all(
      mappings.map(async (m) => {
        const s = await School.findOne({
          udise_code: m.nearby_udise_code,
          visited: false,
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
    console.error("❌ Server error:", e);
    res.status(500).json({ message: e.message });
  }
};

// 4. Mark a nearby school as preferred
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

// 5. Get all schools (for Visit page) – includes visited status
export const getAllSchools = async (req, res) => {
  try {
    const schools = await School.find({})
      .select("udise_code school_name district pincode visited");
    res.json(schools);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// 6. Toggle visited status
export const toggleVisited = async (req, res) => {
  try {
    const { udise } = req.params;
    const { visited } = req.body;

    const school = await School.findOneAndUpdate(
      { udise_code: udise },
      { visited },
      { new: true }
    );

    if (!school) {
      return res.status(404).json({ message: "School not found" });
    }

    res.json({ message: "Visited status updated", visited: school.visited });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};