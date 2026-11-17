import express from 'express';
import cors from 'cors';
import path from 'path';
import authRoutes from './routes/auth.routes';
import doctorRoutes from './routes/doctor.routes';
import slotRoutes from './routes/slot.routes';
import appointmentRoutes from './routes/appointment.routes';
import waitlistRoutes from './routes/waitlist.routes';
import scheduleRoutes from './routes/schedule.routes';
import recordRoutes from './routes/record.routes';
import reviewRoutes from './routes/review.routes';
import adminRoutes from './routes/admin.routes';
import { errorHandler } from './middlewares/error.middleware';
import { startHoldSweeper } from './workers/hold-sweeper';
import { getDb } from './models/db';

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Database schema
getDb();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static uploads directory
app.use('/uploads', express.static(path.resolve(process.cwd(), 'uploads')));

// Health Check
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'HEALTHY', timestamp: new Date().toISOString() });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/slots', slotRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/waitlist', waitlistRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api', recordRoutes);
app.use('/api', reviewRoutes);
app.use('/api/admin', adminRoutes);

// Centralized Error Handler
app.use(errorHandler);

// Start Hold TTL background sweeper (runs every 10 seconds)
startHoldSweeper(10000);

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`===================================================`);
    console.log(`🏥 Doctor Appointment Booking API running on port ${PORT}`);
    console.log(`   Health check: http://localhost:${PORT}/health`);
    console.log(`===================================================`);
  });
}

export default app;

