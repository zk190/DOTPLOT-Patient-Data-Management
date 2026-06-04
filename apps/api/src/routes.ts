import type { FastifyInstance } from "fastify";
import { audit } from "./audit.js";
import { authenticate, requireRole } from "./auth.js";
import { prisma } from "./prisma.js";
import { patientSchema, reportSchema, wardObservationSchema } from "./schemas.js";

const includeCase = {
  imagingStudies: true,
  lesionAnnotations: true
};

export async function registerRoutes(app: FastifyInstance) {
  app.get("/me", { preHandler: authenticate }, async (request) => request.user);

  app.get("/patients", { preHandler: requireRole("RADIOLOGIST", "NURSE", "IT_ADMIN") }, async (request) => {
    await audit(request, "LIST_PATIENTS");
    return prisma.patient.findMany({ orderBy: { updatedAt: "desc" } });
  });

  app.post("/patients", { preHandler: requireRole("RADIOLOGIST", "IT_ADMIN") }, async (request) => {
    const body = patientSchema.parse(request.body);
    const patient = await prisma.patient.create({ data: body });
    await audit(request, "CREATE_PATIENT", patient.id);
    return patient;
  });

  app.get("/patients/:id", { preHandler: requireRole("RADIOLOGIST", "NURSE", "IT_ADMIN") }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const patient = await prisma.patient.findUnique({ where: { id }, include: includeCase });
    if (!patient) return reply.code(404).send({ message: "Patient not found" });
    await audit(request, "READ_PATIENT", id);
    return patient;
  });

  app.put("/patients/:id", { preHandler: requireRole("RADIOLOGIST", "IT_ADMIN") }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = patientSchema.parse(request.body);
    const patient = await prisma.patient.update({ where: { id }, data: body }).catch(() => null);
    if (!patient) return reply.code(404).send({ message: "Patient not found" });
    await audit(request, "UPDATE_PATIENT", id);
    return patient;
  });

  app.delete("/patients/:id", { preHandler: requireRole("IT_ADMIN") }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const patient = await prisma.patient.delete({ where: { id } }).catch(() => null);
    if (!patient) return reply.code(404).send({ message: "Patient not found" });
    await audit(request, "DELETE_PATIENT", id);
    return { ok: true };
  });

  app.post("/ward-observations/:patientId", { preHandler: requireRole("NURSE") }, async (request) => {
    const { patientId } = request.params as { patientId: string };
    const body = wardObservationSchema.parse(request.body);
    await audit(request, `SAVE_WARD_OBSERVATION ${body.bloodPressure}`, patientId);
    return { ok: true, syncStatus: "queued" };
  });

  app.post("/reports", { preHandler: requireRole("RADIOLOGIST") }, async (request, reply) => {
    const body = reportSchema.parse(request.body);
    const patient = await prisma.patient.findUnique({
      where: { id: body.patientId },
      include: includeCase
    });
    if (!patient) return reply.code(404).send({ message: "Patient not found" });

    const lesion = patient.lesionAnnotations[0];
    const report = await prisma.report.create({
      data: {
        patientId: patient.id,
        authorId: request.user.id,
        body: [
          `Patient ${patient.patientCode}`,
          `Diagnosis: ${patient.diagnosis}`,
          `Risk: ${patient.birads}`,
          lesion ? `Lesion: ${lesion.breast} ${lesion.quadrant}, ${lesion.clockFace}, ${lesion.distanceFromNipple}` : "Lesion: not recorded"
        ].join("\n")
      }
    });
    await audit(request, "GENERATE_REPORT", patient.id);
    return report;
  });

  app.get("/audit-events", { preHandler: requireRole("IT_ADMIN") }, async () => {
    return prisma.auditEvent.findMany({
      orderBy: { createdAt: "desc" },
      take: 100
    });
  });
}
