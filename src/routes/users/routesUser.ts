import { createUserRouter } from "./create-user.ts";
import { loginRoute } from "./login.ts";
import type { FastifyInstance } from 'fastify';

export function routesUser(server: FastifyInstance) {
    server.register(createUserRouter)
    server.register(loginRoute)
}