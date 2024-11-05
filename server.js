require('dotenv').config();
const express = require('express');
const cors = require('cors');
const errorHandler = require('./middlewares/authMiddleware');
const connectDB = require('./config/db');
const userRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes')


const app = express();
const PORT = process.env.PORT || 8000;

// Connect to the database
connectDB();

// Middleware
app.use(express.json());  
app.use(express.urlencoded({ extended: true }));

app.use(cors({
    origin: 'http://localhost:3000', 
    methods: 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
    credentials: true
}));

app.options('*', cors());  

// Routes
app.use("/api", userRoutes);
app.use("/api", postRoutes)

// Error handler middleware
app.use(errorHandler);

// Start the server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
