const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');
const auditLogger = require('./middleware/logMiddleware');

// Route imports
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const crimeRoutes = require('./routes/crimeRoutes');
const suspectRoutes = require('./routes/suspectRoutes');
const victimRoutes = require('./routes/victimRoutes');
const evidenceRoutes = require('./routes/evidenceRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

// Extra endpoint controller import for Custom Feature A
const { getCategorySections } = require('./controllers/adminController');
const { protect } = require('./middleware/authMiddleware');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Standard middleware
app.use(cors());
app.use(express.json());

// Custom Audit Log middleware (records non-GET requests to DB logs)
app.use(auditLogger);

// Static uploads folder for future evidence/suspect uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes); // Mounts category CRUD under /api/admin/crime-categories
app.use('/api/crimes', crimeRoutes);
app.use('/api/suspects', suspectRoutes);
app.use('/api/victims', victimRoutes);
app.use('/api/evidence', evidenceRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Custom Feature A direct mapping: GET /api/crime-categories/:id/sections
app.get('/api/crime-categories/:id/sections', protect, getCategorySections);

// Simple Welcome Healthcheck Endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Welcome to CrimeGPT Backend API',
    status: 'Running',
    version: '1.0.0',
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
