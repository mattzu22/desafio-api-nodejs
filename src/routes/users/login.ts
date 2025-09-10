import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { db } from '../../database/client.ts'
import { users } from '../../database/schema.ts'
import jwt from 'jsonwebtoken'
import z from 'zod'
import { eq } from 'drizzle-orm'
import { verify } from 'argon2'
import { checkEnv } from '../../utils/check-env.ts'
import { checkRequestJWT } from '../../hooks/check-request-jwt.ts'

export const loginRoute: FastifyPluginAsyncZod = async (server) => {
  server.post('/sessions', {
    schema: {
      tags: ['auth'],
      summary: 'Login',
      body: z.object({
        email: z.email(),
        password: z.string(),
      }),
      // response: {
      //   200: z.object({ token: z.string() }),
      //   400: z.object({ message: z.string() }),
      // }
    },
  }, async (request, reply) => {
    const { email, password } = request.body

    const result = await db
      .select()
      .from(users)
      .where(eq(users.email, email))

    if (result.length === 0) {
      return reply.status(400).send({ message: 'Credenciais inválidas.' })
    }

    const user = result[0]

    const doesPasswordsMatch = await verify(user.password, password)

    if (!doesPasswordsMatch) {
      return reply.status(400).send({ message: 'Credenciais inválidas.' })
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


// export const refreshTokenRoute: FastifyPluginAsyncZod = async (server) => {
//   server.post('/refreshToken', {
//     preHandler: [
//       checkRequestJWT,
//     ],
//     schema: {
//       tags: ['auth'],
//       summary: 'Refresh token',
//       response: {
//         200: z.object({ token: z.string() }),
//         400: z.object({ message: z.string() }),
//       }
//     },
//   }, async (request, reply) => {
//     console.log('ENTROU NA REFRESH TOKEN');
    

//     const refreshToken = request.cookies.refreshToken

//     console.log('refreshToken', refreshToken);
    

//     if (!refreshToken) {
//       return reply.status(400).send({ message: 'Refresh token not found.' })
//     }

//     try {
//       const env = checkEnv('JWT_SECRET')

//       const payload = jwt.verify(refreshToken, env) as { sub: string, role: string }

//       const newAccessToken = jwt.sign({ sub: payload.sub, role: payload.role }, env, { expiresIn: '1m' })

//       return reply.status(200).send({ token: newAccessToken })
//     } catch (error) {
//       return reply.status(400).send({ message: 'Invalid refresh token.' })
//     }
//   })
// }