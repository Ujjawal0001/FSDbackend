import express from "express";
import Sensor from "../models/Sensor.js";

const router = express.Router();

import User from "../models/User.js";
import Farmer from "../models/Farmer.js";
// ✅ 1. FARMER PROFILE (PUT THIS FIRST)
router.get("/farmer/:userId", async (req, res) => {
  try{
    const farmer = await Farmer.findOne({ userId: req.params.userId });

    if(!farmer){
      return res.status(404).json({ error: "Farmer not found" });
    }

    res.json(farmer);

  }catch(err){
    res.status(500).json({ error: "Server error" });
  }
});
router.put("/farmer/:userId", async (req, res) => {
  try{
    console.log("👉 UPDATE HIT");
    console.log("PARAM:", req.params.userId);
    console.log("BODY:", req.body);

    const updated = await Farmer.findOneAndUpdate(
      { userId: req.params.userId },
      req.body,
      { new: true }
    );

    console.log("UPDATED:", updated);

    res.json({ success:true });

  }catch(err){
    console.log("ERROR:", err);
    res.status(500).json({ error:"Update failed" });
  }
});

// ✅ 2. ALL FARMERS
router.get("/all", async (req, res) => {
  try{
    const users = await Farmer.find();

    const sensors = await Sensor.aggregate([
      { $sort: { timestamp: -1 } },
      {
        $group: {
          _id: "$userId",
          temperature: { $first: "$temperature" },
          humidity: { $first: "$humidity" },
          soilMoisture: { $first: "$soilMoisture" }
        }
      }
    ]);

    const result = users.map(u => {
      const sensor = sensors.find(s => s._id === u.userId);

      return {
        userId: u.userId,
        farmName: u.farmName,
        location: u.location,
        cropType: u.cropType,
        landSize: u.landSize,
        temperature: sensor?.temperature || 0,
        humidity: sensor?.humidity || 0,
        soilMoisture: sensor?.soilMoisture || 0
      };
    });

    res.json(result);

  }catch(err){
    res.status(500).json({ error:"Server error" });
  }
});


// ✅ 3. SENSOR DATA
router.get("/:userId", async (req, res) => {
  try {
    const data = await Sensor.find({ userId: req.params.userId })
      .sort({ timestamp: -1 });

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/all", async (req, res) => {
  try{

    // 🟢 GET ALL FARMERS
    const users = await Farmer.find();

    // 🟢 GET LATEST SENSOR DATA
    const sensors = await Sensor.aggregate([
      { $sort: { timestamp: -1 } },
      {
        $group: {
          _id: "$userId",
          temperature: { $first: "$temperature" },
          humidity: { $first: "$humidity" },
          soilMoisture: { $first: "$soilMoisture" }
        }
      }
    ]);

    // 🧠 MERGE BOTH
    const result = users.map(u => {

      const sensor = sensors.find(s => s._id === u.userId);

      return {
        userId: u.userId,
        farmName: u.farmName,
        location: u.location,
        cropType: u.cropType,
        landSize: u.landSize,

        temperature: sensor?.temperature || 0,
        humidity: sensor?.humidity || 0,
        soilMoisture: sensor?.soilMoisture || 0
      };
    });

    res.json(result);

  }catch(err){
    console.log(err);
    res.status(500).json({ error:"Server error" });
  }
});

// ✅ SECOND: GET DATA BY USER ID


export default router;