import type { FastifyRequest, FastifyReply } from 'fastify'
import { getAuthenticatedUserFromRequest } from '../utils/get-authenticated-user-from-request.ts'
import { UnauthorizedError } from '../utils/erros.ts'

export function checkUserRole(role: 'student' | 'manager') {
  return async function (request: FastifyRequest, reply: FastifyReply) {
    const user = getAuthenticatedUserFromRequest(request)
  
    if (user.role !== role) {
      throw new UnauthorizedError()
    }
  }
}