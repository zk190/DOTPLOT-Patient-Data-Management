import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

export const patientSchema = z.object({
  patientCode: z.string().min(3),
  nhsNumber: z.string().min(6),
  name: z.string().min(2),
  age: z.number().int().min(16).max(120),
  allergies: z.string().default("None recorded"),
  medications: z.string().default("None recorded"),
  diagnosis: z.string().min(3),
  birads: z.string().min(3)
});

export const wardObservationSchema = z.object({
  temperatureC: z.number().min(30).max(45),
  pulseBpm: z.number().int().min(30).max(220),
  bloodPressure: z.string().regex(/^[0-9]{2,3}\/[0-9]{2,3}$/),
  medicationDose: z.string().regex(/^\d+(\.\d+)?\s?(mg|microgram|mcg|µg)$/i),
  allergyUpdate: z.string().optional()
});

export const reportSchema = z.object({
  patientId: z.string().min(1)
});
