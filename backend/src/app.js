import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import apiRoutes from './routes/api.js';

const app = express();

// Middleware
app.use(helmet()); // Security
app.use(cors());   // Allow React Frontend to connect
app.use(express.json()); // Parse JSON bodies

// Routes
app.use('/api', apiRoutes);

// 404 Handler
app.use((req, res) => res.status(404).json({ message: "Route not found" }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));