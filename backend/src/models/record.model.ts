import { z } from 'zod';

export const RecordTypeEnum = z.enum([
  'PRESCRIPTION',
  'LAB_REPORT',
  'DIAGNOSTIC_IMAGE',
  'VISIT_SUMMARY',
  'OTHER'
]);

export const MedicalRecordSchema = z.object({
  id: z.string().uuid(),
  appointmentId: z.string().uuid().optional().nullable(),
  patientId: z.string().uuid(),
  uploadedByUserId: z.string().uuid(),
  recordType: RecordTypeEnum,
  fileName: z.string().min(1),
  fileMimeType: z.string().min(1),
  fileSizeBytes: z.number().nonnegative(),
  fileStorageKey: z.string().min(1),
  notes: z.string().optional().nullable(),
  createdAt: z.string()
});

export type MedicalRecord = z.infer<typeof MedicalRecordSchema>;

