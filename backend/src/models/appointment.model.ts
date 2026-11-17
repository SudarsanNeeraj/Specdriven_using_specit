import { z } from 'zod';

export const SlotStatusEnum = z.enum(['AVAILABLE', 'HELD', 'BOOKED', 'BLOCKED']);
export const ConsultationTypeEnum = z.enum(['IN_PERSON', 'VIDEO']);
export const AppointmentStatusEnum = z.enum(['CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW']);
export const PaymentStatusEnum = z.enum(['PAID', 'PENDING', 'AT_CLINIC', 'REFUNDED']);

export const AppointmentSlotSchema = z.object({
  id: z.string().uuid(),
  doctorId: z.string().uuid(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  status: SlotStatusEnum,
  heldByUserId: z.string().uuid().nullable().optional(),
  holdExpiresAt: z.string().datetime().nullable().optional()
});

export const CreateAppointmentSchema = z.object({
  slotId: z.string().uuid(),
  consultationType: ConsultationTypeEnum,
  patientNotes: z.string().max(1000).optional(),
  paymentMethod: z.enum(['ONLINE_CARD', 'ONLINE_UPI', 'PAY_AT_CLINIC'])
});

export type AppointmentSlot = z.infer<typeof AppointmentSlotSchema>;
export type CreateAppointmentInput = z.infer<typeof CreateAppointmentSchema>;

