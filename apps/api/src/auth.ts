import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { roles, type Role } from "@dotplot/shared";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma.js";
import { loginSchema } from "./schemas.js";

declare module "fastify" {
  interface FastifyRequest {
    user: {
      id: string;
      name: string;
      email: string;
      role: Role;
    };
  }
}

export async function registerAuth(app: FastifyInstance) {
  app.post("/auth/login", async (request, reply) => {
    const body = loginSchema.parse(request.body);
    const user = await prisma.user.findUnique({ where: { email: body.email } });
    if (!user || !bcrypt.compareSync(body.password, user.passwordHash)) {
      return reply.code(401).send({ message: "Invalid credentials" });
    }

    const role = parseRole(user.role);
    const token = app.jwt.sign({
      id: user.id,
      name: user.name,
      email: user.email,
      role
    });

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role
      }
    };
  });
}

function parseRole(value: string): Role {
  if (roles.includes(value as Role)) return value as Role;
  throw new Error(`Unsupported role ${value}`);
}

export async function authenticate(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify();
  } catch {
    reply.code(401).send({ message: "Authentication required" });
  }
}

export function requireRole(...allowed: Role[]) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    await authenticate(request, reply);
    if (reply.sent) return;
    if (!allowed.includes(request.user.role)) {
      reply.code(403).send({ message: "Insufficient role for this clinical action" });
    }
  };
}
