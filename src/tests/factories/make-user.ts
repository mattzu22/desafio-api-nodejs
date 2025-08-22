import { faker } from "@faker-js/faker";
import jwt from 'jsonwebtoken'
import { db } from "../../database/client.ts";
import { users } from "../../database/schema.ts";
import { hash } from "argon2";
import { randomUUID } from 'node:crypto';
import { checkEnv } from "../../utils/check-env.ts";

export async function makeUser(role?: 'manager' | 'student') {
  const passwordBeforeHash = randomUUID()

  const result = await db.insert(users).values({
    name: faker.person.fullName(),
    email: faker.internet.email(),
    password: await hash(passwordBeforeHash),
    role,
  }).returning()

  return {
    user: result[0],
    passwordBeforeHash,
  }
}

export async function makeAuthenticatedUser(role: 'manager' | 'student') {
  const { user } = await makeUser(role)

  const env = checkEnv('JWT_SECRET')

  const token = jwt.sign({ sub: user.id, role: user.role }, env)

  return { user, token }
}