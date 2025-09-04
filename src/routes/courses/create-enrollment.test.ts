
import { expect, test } from "vitest";
import { server } from "../../app.ts";

import request from 'supertest'
import { makeCreateEnrollment } from "../../tests/factories/make-enrollment.ts";

test('create an enrollment', async () => {
    await server.ready()

    const { token, course } = await makeCreateEnrollment()

    const response = await request(server.server)
        .post(`/enrollments/${course.id}`)
        .set('Authorization', token)

    expect(response.status).toEqual(201)
    expect(response.body).toEqual({
        enrollmentId: expect.any(String),
    })
})

test('Não deve permitir que o usuário se cadaste em mais de um curso', async () => {
    await server.ready()

    const { token, course } = await makeCreateEnrollment()

    await request(server.server)
        .post(`/enrollments/${course.id}`)
        .set('Authorization', token)

    const response = await request(server.server)
        .post(`/enrollments/${course.id}`)
        .set('Authorization', token)

    expect(response.status).toEqual(400)
    expect(response.body).toEqual({
        message: 'Você já se inscreveu neste curso.',
    })
})