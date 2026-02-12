import express from "express";
import {
  getDistricts,
  getSchoolsByDistrict,
  getSchoolWithNearby,
  markPreferred,
  getAllSchools,
  toggleVisited,
} from "../controllers/school.controller.js";

const router = express.Router();

router.get("/districts", getDistricts);
router.get("/district/:district", getSchoolsByDistrict);
router.get("/all", getAllSchools);
router.get("/:udise", getSchoolWithNearby);
router.post("/preferred", markPreferred);
router.patch("/:udise/visited", toggleVisited);

export default router;