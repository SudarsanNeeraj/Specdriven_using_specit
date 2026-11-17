import { z } from 'zod';

export const DoctorScheduleSchema = z.object({
  id: z.string().uuid().optional(),
  dayOfWeek: z.number().int().min(0).max(6),
  shiftStartTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
  shiftEndTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
  breakStartTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/).optional().nullable(),
  breakEndTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/).optional().nullable(),
  slotDurationMinutes: z.union([z.literal(15), z.literal(30), z.literal(45), z.literal(60)]).default(30),
  isActive: z.boolean().default(true)
});

export const ScheduleBlockSchema = z.object({
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  reason: z.string().min(1),
  isEmergency: z.boolean().default(false)
});

export type DoctorSchedule = z.infer<typeof DoctorScheduleSchema>;
export type ScheduleBlock = z.infer<typeof ScheduleBlockSchema>;

