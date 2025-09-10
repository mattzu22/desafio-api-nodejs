import { createUserRouter } from "./create-user.ts";
import { loginRoute } from "./login.ts";
import type { FastifyInstance } from 'fastify';
import { refreshTokenRoute } from "./refreshToken.ts";

export function routesUser(server: FastifyInstance) {
    server.register(createUserRouter)
    server.register(loginRoute)
    server.register(refreshTokenRoute)
}