import { z } from 'zod';

export const DoctorProfileSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  specialization: z.string().min(1),
  qualifications: z.string().min(1),
  experienceYears: z.number().int().nonnegative().default(0),
  languages: z.array(z.string()),
  bio: z.string().optional().nullable(),
  clinicName: z.string().min(1),
  clinicAddress: z.string().min(1),
  city: z.string().min(1),
  inPersonFee: z.number().positive(),
  videoFee: z.number().positive(),
  ratingAvg: z.number().min(0).max(5).default(0),
  ratingCount: z.number().int().nonnegative().default(0)
});

export type DoctorProfile = z.infer<typeof DoctorProfileSchema>;

export interface DoctorCardDto {
  id: string;
  name: string;
  email: string;
  specialization: string;
  qualifications: string;
  experienceYears: number;
  city: string;
  clinicName: string;
  clinicAddress: string;
  languages: string[];
  inPersonFee: number;
  videoFee: number;
  ratingAvg: number;
  ratingCount: number;
  nextAvailableSlot?: string | null;
}

