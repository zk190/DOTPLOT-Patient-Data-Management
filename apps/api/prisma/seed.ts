import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.auditEvent.deleteMany();
  await prisma.report.deleteMany();
  await prisma.lesionAnnotation.deleteMany();
  await prisma.imagingStudy.deleteMany();
  await prisma.patient.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = bcrypt.hashSync("Dotplot123!", 10);
  await prisma.user.createMany({
    data: [
      { name: "Dr Kaur", email: "radiologist@dotplot.test", role: "RADIOLOGIST", passwordHash },
      { name: "Nurse Adebayo", email: "nurse@dotplot.test", role: "NURSE", passwordHash },
      { name: "Mr Chen", email: "it@dotplot.test", role: "IT_ADMIN", passwordHash }
    ]
  });

  const maya = await prisma.patient.create({
    data: {
      patientCode: "DTP-1007",
      nhsNumber: "485 777 2102",
      name: "Maya Patel",
      age: 52,
      allergies: "Penicillin",
      medications: "Tamoxifen 20 mg daily",
      diagnosis: "Suspicious irregular hypoechoic lesion",
      birads: "BI-RADS 4B"
    }
  });
  const mayaScan = await prisma.imagingStudy.create({
    data: {
      patientId: maya.id,
      scanCode: "US-L-4421",
      modality: "ULTRASOUND",
      studyDate: new Date("2026-05-20"),
      imageUrl: "/mock-ultrasound-left.svg"
    }
  });
  await prisma.lesionAnnotation.create({
    data: {
      patientId: maya.id,
      imagingStudyId: mayaScan.id,
      breast: "LEFT",
      quadrant: "Upper-outer quadrant",
      clockFace: "2 o'clock",
      distanceFromNipple: "4 cm from nipple",
      torsoX: 107,
      torsoY: 207,
      previewX: 43,
      previewY: 45,
      birads: "BI-RADS 4B",
      diagnosis: maya.diagnosis
    }
  });

  const lina = await prisma.patient.create({
    data: {
      patientCode: "DTP-1012",
      nhsNumber: "622 140 9348",
      name: "Lina Chen",
      age: 47,
      allergies: "None recorded",
      medications: "Amlodipine 5 mg daily",
      diagnosis: "Probably benign circumscribed mass",
      birads: "BI-RADS 3"
    }
  });
  const linaScan = await prisma.imagingStudy.create({
    data: {
      patientId: lina.id,
      scanCode: "US-R-1088",
      modality: "ULTRASOUND",
      studyDate: new Date("2026-05-25"),
      imageUrl: "/mock-ultrasound-right.svg"
    }
  });
  await prisma.lesionAnnotation.create({
    data: {
      patientId: lina.id,
      imagingStudyId: linaScan.id,
      breast: "RIGHT",
      quadrant: "Lower-inner quadrant",
      clockFace: "5 o'clock",
      distanceFromNipple: "2 cm from nipple",
      torsoX: 209,
      torsoY: 260,
      previewX: 55,
      previewY: 52,
      birads: "BI-RADS 3",
      diagnosis: lina.diagnosis
    }
  });
}

main().finally(async () => prisma.$disconnect());
