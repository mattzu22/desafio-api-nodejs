import z from "zod";
import { db } from "../../database/client.ts";
import { users } from "../../database/schema.ts";
import { eq } from "drizzle-orm";
import { hash } from "argon2";
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'

export const createUserRouter: FastifyPluginAsyncZod =
    async (server) => {
        server.post('/users', {
            schema: {
                tags: ['users'],
                summary: 'Create a user',
                body: z.object({
                    name: z.string().nonempty(),
                    email: z.string().email(),
                    password: z.string(),
                    role: z.enum(['student', 'manager'])
                }),
                response: {
                    201: z.object({ userId: z.string() }),
                    400: z.object({ message: z.string() }),
                }

            }
        }, async (request, reply) => {
            const { name, email, password, role } = request.body;

            const existingEmail = await db
                .select()
                .from(users)
                .where(eq(users.email, email))
                .limit(1);

            if (existingEmail.length > 0) {
                return reply.status(400).send({ message: 'Email já existe' });
            }

            const passwordHash = await hash(password);

            const result = await db.insert(users).values({
                name,
                email,
                password: passwordHash,
                role
            }).returning();

            return reply.status(201).send({ userId: result[0].id });
        })
    }