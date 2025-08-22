import fastify from 'fastify'
import { fastifySwagger } from '@fastify/swagger'
import { validatorCompiler, serializerCompiler, type ZodTypeProvider, jsonSchemaTransform } from 'fastify-type-provider-zod'
import { createCourseRoute } from './routes/courses/create-course.ts'
import { getCourseByIdRoute } from './routes/courses/get-course-by-id.ts'
import { getCoursesRoute } from './routes/courses/get-courses.ts'
import scalarAPIReference from '@scalar/fastify-api-reference'
import { routesUser } from './routes/users/routesUser.ts'
import { routesCourse } from './routes/courses/routesCourse.ts'

const server = fastify({
  logger: {
    transport: {
      target: 'pino-pretty',
      options: {
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname',
      },
    },
  },
}).withTypeProvider<ZodTypeProvider>()

if (process.env.NODE_ENV === 'development') {
  server.register(fastifySwagger, {
    openapi: {
      info: {
        title: 'Desafio Node.js',
        version: '1.0.0',
      }
    },
    transform: jsonSchemaTransform,
  })
  
  server.register(scalarAPIReference, {
    routePrefix: '/docs',
  })
}

server.setValidatorCompiler(validatorCompiler)
server.setSerializerCompiler(serializerCompiler)

routesCourse(server)
routesUser(server)

export { server }