const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Import routes
const authRoutes = require('./routes/auth');
const aktaRoutes = require('./routes/akta');
const transaksiRoutes = require('./routes/transaksi');
const inventarisRoutes = require('./routes/inventaris');
const pegawaiRoutes = require('./routes/pegawai');
const dashboardRoutes = require('./routes/dashboard');

// Use routes
app.use('/api', authRoutes);
app.use('/api/akta', aktaRoutes);
app.use('/api/transaksi', transaksiRoutes);
app.use('/api/inventaris', inventarisRoutes);
app.use('/api/pegawai', pegawaiRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Start server
app.listen(PORT, () => {
    console.log('========================================');
    console.log('🚀 Server running on http://localhost:' + PORT);
    console.log('========================================');
    console.log('📊 API Endpoints ready:');
    console.log('   POST   /api/login');
    console.log('   GET    /api/akta');
    console.log('   POST   /api/akta');
    console.log('   PUT    /api/akta/:id');
    console.log('   DELETE /api/akta/:id');
    console.log('   GET    /api/transaksi');
    console.log('   GET    /api/inventaris');
    console.log('   GET    /api/pegawai');
    console.log('   GET    /api/dashboard/stats');
    console.log('========================================');
});

module.exports = app;