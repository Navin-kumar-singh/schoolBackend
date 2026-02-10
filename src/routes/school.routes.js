import express from "express";
import {
  getDistricts,
  getSchoolsByDistrict,
  getSchoolWithNearby,
  markPreferred,
} from "../controllers/school.controller.js";

const router = express.Router();

router.get("/districts", getDistricts);
router.get("/district/:district", getSchoolsByDistrict);
router.get("/:udise", getSchoolWithNearby);
router.post("/preferred", markPreferred);

export default router;
