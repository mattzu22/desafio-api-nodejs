import type { FastifyRequest, FastifyReply } from 'fastify'
import jwt from 'jsonwebtoken'
import { NotFoundError, UnauthorizedError } from '../utils/erros.ts'


type JWTPayload = {
  sub: string
  role: 'student' | 'manager'
}

export async function checkRequestJWT(request: FastifyRequest, reply: FastifyReply) {
  const token = request.headers.authorization

  if (!token) {
    throw new UnauthorizedError()
  }

  if (!process.env.JWT_SECRET) {
    throw new NotFoundError('JWT_SECRET must be set.')
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET) as JWTPayload

    request.user = payload
  } catch {
    return reply.status(401).send()
  }
}