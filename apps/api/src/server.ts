import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import Fastify from "fastify";
import { ZodError } from "zod";
import { registerAuth } from "./auth.js";
import { registerRoutes } from "./routes.js";

export async function buildServer() {
  const app = Fastify({ logger: true });

  await app.register(cors, {
    origin: [/^http:\/\/localhost:\d+$/, /^http:\/\/127\.0\.0\.1:\d+$/]
  });
  await app.register(jwt, {
    secret: process.env.JWT_SECRET ?? "dev-only-replace-me"
  });
  await app.register(swagger, {
    openapi: {
      info: {
        title: "Dotplot API",
        version: "0.2.0"
      }
    }
  });
  await app.register(swaggerUi, { routePrefix: "/docs" });

  app.setErrorHandler((error, _request, reply) => {
    if (error instanceof ZodError) {
      return reply.code(400).send({ message: "Validation failed", issues: error.issues });
    }
    return reply.send(error);
  });

  await registerAuth(app);
  await registerRoutes(app);

  app.get("/health", async () => ({ ok: true }));

  return app;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const app = await buildServer();
  const port = Number(process.env.PORT ?? 4000);
  await app.listen({ port, host: "0.0.0.0" });
}
