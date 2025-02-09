require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// GitHub configuration
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPO = process.env.GITHUB_REPO;
const GITHUB_OWNER = process.env.GITHUB_OWNER;

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB:', err));

// Prediction Schema
const predictionSchema = new mongoose.Schema({
  name: String,
  coinToss: String,
  firstScore: String,
  firstScoreType: String,
  nullifiedTD: String,
  passingYards: String,
  firstTouchdown: String,
  totalTouchdowns: Number,
  totalInterceptions: Number,
  totalSacks: Number,
  fieldGoalAttempts: Number,
  fieldGoalsMade: Number,
  possessionTime: String,
  morePenalties: String,
  defenseSpecialTD: String,
  anthemLength: Number,
  gatoradeColor: String,
  halftimeFirstSong: String,
  surprisePerformer: String,
  beerCommercials: Number,
  taylorSwiftAppearance: String,
  legacyMentions: Number,
  aiCommercials: Number,
  proposal: String,
  celebrityCount: Number,
  totalScore: Number,
  createdAt: { type: Date, default: Date.now }
});

const Prediction = mongoose.model('Prediction', predictionSchema);

// Function to create file in GitHub
async function createFileInGitHub(prediction) {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `predictions/${prediction.name.replace(/\s+/g, '-')}-${timestamp}.json`;
    const content = Buffer.from(JSON.stringify(prediction, null, 2)).toString('base64');

    const response = await axios({
      method: 'PUT',
      url: `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${fileName}`,
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json'
      },
      data: {
        message: `Nueva predicción de ${prediction.name}`,
        content: content
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error creating file in GitHub:', error);
    throw error;
  }
}

// Routes
app.post('/api/predictions', async (req, res) => {
  try {
    const prediction = new Prediction(req.body);
    await prediction.save();
    
    // Create file in GitHub
    await createFileInGitHub(prediction);
    
    res.status(201).json(prediction);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.get('/api/predictions', async (req, res) => {
  try {
    const predictions = await Prediction.find().sort({ createdAt: -1 });
    res.json(predictions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.delete('/api/predictions', async (req, res) => {
  try {
    await Prediction.deleteMany({});
    res.json({ message: 'All predictions deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 