import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { db } from '../../database/client.ts'
import { users } from '../../database/schema.ts'
import jwt from 'jsonwebtoken'
import z from 'zod'
import { eq } from 'drizzle-orm'
import { verify } from 'argon2'
import { checkEnv } from '../../utils/check-env.ts'
import { checkRequestJWT } from '../../hooks/check-request-jwt.ts'
import { BadRequestError } from '../../utils/erros.ts'

export const loginRoute: FastifyPluginAsyncZod = async (server) => {
  server.post('/sessions', {
    schema: {
      tags: ['auth'],
      summary: 'Login',
      body: z.object({
        email: z.email(),
        password: z.string(),
      }),
    response: {
  200: z.object({
    accessToken: z.string(),
    refreshToken: z.string(),
  }),
  400: z.object({
    message: z.string(),
  }),
}
    },
  }, async (request, reply) => {
    const { email, password } = request.body

    const result = await db
      .select()
      .from(users)
      .where(eq(users.email, email))

    if (result.length === 0) {
      throw new BadRequestError('Credenciais inválidas.')
    }

    const user = result[0]

    const doesPasswordsMatch = await verify(user.password, password)

    if (!doesPasswordsMatch) {
      throw new BadRequestError('Credenciais inválidas.')
    }

    const env = checkEnv('JWT_SECRET')

    const accessToken = jwt.sign({ sub: user.id, role: user.role }, env, { expiresIn: '1m' })
    const refreshToken = jwt.sign({ sub: user.id, role: user.role }, env, { expiresIn: '7d' })

    return reply.setCookie('refreshToken', refreshToken, {
      path: '/',
      secure: true,
      httpOnly: true,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60
    })
      .status(200).send({ accessToken, refreshToken })
  })
}
