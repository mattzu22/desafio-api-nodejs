import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { checkRequestJWT } from "../../hooks/check-request-jwt.ts";
import z from "zod";
import { getAuthenticatedUserFromRequest } from "../../utils/get-authenticated-user-from-request.ts";
import { db } from "../../database/client.ts";
import { enrollments } from "../../database/schema.ts";
import { and, eq } from "drizzle-orm";
import { BadRequestError } from "../../utils/erros.ts";

export const createEnrollmentRoute: FastifyPluginAsyncZod = async (server) => {
    server.post('/enrollments/:courseId', {
        preHandler: [
            checkRequestJWT,
        ],
        schema: {
            tags: ['enrollments'],
            summary: 'Create an enrollment',
            params: z.object({
                courseId: z.uuid(),
            }),
            response: {
                201: z.object({ enrollmentId: z.string() }),
                400: z.object({ message: z.string() }),
            }
        },
    }, async (request, reply) => {
        const courseId = request.params.courseId
        const user = getAuthenticatedUserFromRequest(request)

        const existingEnrollment = await db
            .select()
            .from(enrollments)
            .where(
                and(
                    eq(enrollments.courseId, courseId),
                    eq(enrollments.userId, user.sub)
                ))

        if (existingEnrollment.length > 0) {
            throw new BadRequestError('Você já se inscreveu neste curso.')
        }

        const result = await db
            .insert(enrollments)
            .values({ userId: user.sub, courseId: courseId })
            .returning()

        return reply.status(201).send({ enrollmentId: result[0].id })
    })
}