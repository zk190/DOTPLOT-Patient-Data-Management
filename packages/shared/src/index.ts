export const roles = ["RADIOLOGIST", "NURSE", "IT_ADMIN"] as const;

export type Role = (typeof roles)[number];

export type PatientSummary = {
  id: string;
  patientCode: string;
  nhsNumber: string;
  name: string;
  age: number;
  allergies: string;
  medications: string;
  diagnosis: string;
  birads: string;
  createdAt: string;
  updatedAt: string;
};

export type ImagingStudy = {
  id: string;
  patientId: string;
  scanCode: string;
  modality: "ULTRASOUND" | "MRI";
  studyDate: string;
  imageUrl: string;
};

export type LesionAnnotation = {
  id: string;
  patientId: string;
  imagingStudyId: string;
  breast: "LEFT" | "RIGHT";
  quadrant: string;
  clockFace: string;
  distanceFromNipple: string;
  torsoX: number;
  torsoY: number;
  previewX: number;
  previewY: number;
  birads: string;
  diagnosis: string;
};

export type PatientCase = PatientSummary & {
  imagingStudies: ImagingStudy[];
  lesionAnnotations: LesionAnnotation[];
};

export type AuditEvent = {
  id: string;
  userId: string;
  role: Role;
  action: string;
  patientId: string | null;
  createdAt: string;
};

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
};
