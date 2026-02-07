import express from "express";
import {
  searchSchool,
  markPreferred,
} from "../controllers/school.controller.js";

const router = express.Router();

router.get("/:udise", searchSchool);
router.put("/preferred", markPreferred);

export default router;
