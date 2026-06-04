import type { FastifyRequest } from "fastify";
import { prisma } from "./prisma.js";

export async function audit(request: FastifyRequest, action: string, patientId?: string) {
  await prisma.auditEvent.create({
    data: {
      userId: request.user.id,
      role: request.user.role,
      action,
      patientId
    }
  });
}
