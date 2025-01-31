const express = require("express");
const cors = require("cors"); // Import the cors package
const app = express();
const port = 3000;

const mongoose = require("mongoose");

const mongodb = "mongodb://localhost:27017/satellite";

app.use(express.json()); // Middleware to parse JSON bodies

// Use CORS middleware
app.use(cors({
    origin: 'http://localhost:5173' // Allow requests from this origin
}));

mongoose.connect(mongodb)
    .then(() => {
        console.log("Connected to MongoDB successfully");
        app.listen(port, () => {
            console.log(`Server is running at port ${port}`);
        });
    })
    .catch((err) => {
        console.log("Failed to connect to MongoDB:", err);
    });

const satelliteSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    orbitType: { type: String, required: true },
    speed: { type: Number, required: true },
    altitude: { type: Number, default: null },
    latitude: { type: Number, default: null },
    longitude: { type: Number, default: null },
    lastUpdated: { type: Date, required: true },
    addedAt: { type: Date, required: true },
    visibility: { type: Boolean, required: true },
    details: { type: String, required: true }
});

const satelliteModel = mongoose.model("satellite", satelliteSchema);

// GET All Satellites
app.get("/api/allsatellite", async (req, res) => {
    try {
        const satellites = await satelliteModel.find();
        if (satellites.length === 0) {
            return res.status(404).json({ message: "No satellites found" });
        }
        res.status(200).json(satellites);
    } catch (error) {
        console.error(error); 
        res.status(500).json({ message: "Failed to fetch satellites" });
    }
});

// GET Satellite by Name
app.get('/api/satellite', async (req, res) => {
    try {
        const { name } = req.query; // Extract the name from query parameters
        const satellite = await satelliteModel.findOne({ name });
        if (!satellite) {
            return res.status(404).json({ message: "Satellite not found" });
        }
        res.status(200).json(satellite);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to fetch satellite" });
    }
});

// DELETE Satellite by ID
app.delete('/api/delsatellite/:id', async (req, res) => {
    try {
        const { id } = req.params; // Extract the 'id' parameter from the URL
        const result = await satelliteModel.findOneAndDelete({ id });
        if (!result) {
            return res.status(404).json({ message: "Satellite not found" });
        }
        res.status(200).json({ message: "Satellite deleted successfully", deletedSatellite: result });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to delete satellite" });
    }
});

// POST API - Add a New Satellite
app.post('/api/addsatellite', async (req, res) => {
    try {
        const satelliteData = req.body; // Satellite details from the request body
        const newSatellite = new satelliteModel(satelliteData);
        await newSatellite.save();
        res.status(201).json({ message: "Satellite added successfully", satellite: newSatellite });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to add satellite", error: error.message });
    }
});

// PUT API - Update an Existing Satellite
app.put('/api/updatesatellite/:id', async (req, res) => {
    try {
        const { id } = req.params; // Extract the 'id' from URL parameters
        const updateData = req.body; // Updated details from the request body

        const updatedSatellite = await satelliteModel.findOneAndUpdate(
            { id },
            updateData,
            { new: true } // Return the updated document
        );

        if (!updatedSatellite) {
            return res.status(404).json({ message: "Satellite not found" });
        }

        res.status(200).json({ message: "Satellite updated successfully", updatedSatellite });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to update satellite", error: error.message });
    }
});
