import { getDb } from '../models/db';

export class ReportService {
  public static getOperationalReport(startDate?: string, endDate?: string): any {
    const db = getDb();
    const dateFilter = startDate && endDate
      ? `WHERE a.created_at >= '${startDate}' AND a.created_at <= '${endDate} 23:59:59'`
      : `WHERE a.created_at >= datetime('now', '-30 days')`;

    // 1. Booking counts by status
    const counts = db.prepare(`
      SELECT 
        COUNT(*) AS totalBookings,
        SUM(CASE WHEN a.status = 'COMPLETED' THEN 1 ELSE 0 END) AS completedVisits,
        SUM(CASE WHEN a.status = 'CANCELLED' THEN 1 ELSE 0 END) AS cancelledBookings,
        SUM(CASE WHEN a.status = 'NO_SHOW' THEN 1 ELSE 0 END) AS noShows,
        SUM(CASE WHEN a.payment_status = 'PAID' OR a.status = 'COMPLETED' THEN a.fee_amount ELSE 0 END) AS totalRevenue
      FROM appointments a
      ${dateFilter}
    `).get() as any;

    const total = counts.totalBookings || 0;
    const completed = counts.completedVisits || 0;
    const cancelled = counts.cancelledBookings || 0;
    const noShows = counts.noShows || 0;
    const revenue = counts.totalRevenue || 0;

    const cancellationRatePercent = total > 0 ? parseFloat(((cancelled / total) * 100).toFixed(1)) : 0.0;
    const noShowRatePercent = total > 0 ? parseFloat(((noShows / total) * 100).toFixed(1)) : 0.0;

    // 2. Doctor schedule utilization
    const slotStats = db.prepare(`
      SELECT 
        COUNT(*) AS totalSlots,
        SUM(CASE WHEN status = 'BOOKED' THEN 1 ELSE 0 END) AS bookedSlots
      FROM appointment_slots
    `).get() as any;

    const totalSlots = slotStats.totalSlots || 1;
    const bookedSlots = slotStats.bookedSlots || 0;
    const doctorUtilizationRatePercent = parseFloat(((bookedSlots / totalSlots) * 100).toFixed(1));

    // 3. Specialization breakdown
    const specStats = db.prepare(`
      SELECT d.specialization, COUNT(a.id) AS count, SUM(a.fee_amount) AS revenue
      FROM appointments a
      JOIN doctor_profiles d ON a.doctor_id = d.id
      GROUP BY d.specialization
    `).all();

    // 4. Doctor utilization ranking
    const doctorUtilization = db.prepare(`
      SELECT d.id, u.name, d.specialization, d.clinic_name AS clinicName,
             COUNT(a.id) AS totalAppointments,
             SUM(CASE WHEN a.status = 'COMPLETED' THEN 1 ELSE 0 END) AS completedCount
      FROM doctor_profiles d
      JOIN users u ON d.user_id = u.id
      LEFT JOIN appointments a ON d.id = a.doctor_id
      GROUP BY d.id
      ORDER BY totalAppointments DESC
    `).all();

    return {
      dateRange: startDate && endDate ? `${startDate} to ${endDate}` : 'Last 30 Days',
      totalBookings: total,
      completedVisits: completed,
      cancellationRatePercent,
      noShowRatePercent,
      totalRevenue: revenue,
      doctorUtilizationRatePercent,
      specializationBreakdown: specStats,
      doctorUtilization
    };
  }
}

