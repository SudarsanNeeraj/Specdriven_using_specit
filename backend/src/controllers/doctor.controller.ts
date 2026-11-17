import { Request, Response, NextFunction } from 'express';
import { DoctorService } from '../services/doctor.service';

export class DoctorController {
  public static async search(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { query, specialization, city, maxFee, language, date } = req.query;
      const doctors = DoctorService.searchDoctors({
        query: query ? String(query) : undefined,
        specialization: specialization ? String(specialization) : undefined,
        city: city ? String(city) : undefined,
        maxFee: maxFee ? Number(maxFee) : undefined,
        language: language ? String(language) : undefined,
        date: date ? String(date) : undefined
      });
      res.status(200).json(doctors);
    } catch (err) {
      next(err);
    }
  }

  public static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const doctor = DoctorService.getDoctorById(id);
      res.status(200).json(doctor);
    } catch (err) {
      next(err);
    }
  }

  public static async getSlots(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const { startDate, endDate } = req.query;
      const slots = DoctorService.getDoctorSlots(
        id,
        startDate ? String(startDate) : undefined,
        endDate ? String(endDate) : undefined
      );
      res.status(200).json(slots);
    } catch (err) {
      next(err);
    }
  }
}
