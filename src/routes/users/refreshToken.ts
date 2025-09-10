import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import z from "zod";
import { checkEnv } from "../../utils/check-env.ts";
import jwt from 'jsonwebtoken'

export const refreshTokenRoute: FastifyPluginAsyncZod = async (server) => {
    server.post('/refreshToken', {
        schema: {
            tags: ['auth'],
            summary: 'Refresh token',
            response: {
                200: z.object({ token: z.string() }),
                400: z.object({ message: z.string() }),
            }
        },
    }, async (request, reply) => {
        const refreshToken = request.headers.cookie

        if (!refreshToken) {
            return reply.status(400).send({ message: 'Refresh token not found.' })
        }

        try {
            const env = checkEnv('JWT_SECRET')

            const payload = jwt.verify(refreshToken, env) as { sub: string, role: string }

            const newAccessToken = jwt.sign({ sub: payload.sub, role: payload.role }, env, { expiresIn: '1m' })

            return reply.status(200).send({ token: newAccessToken })
        } catch (error) {
            return reply.status(400).send({ message: 'Invalid refresh token.' })
        }
    })
}