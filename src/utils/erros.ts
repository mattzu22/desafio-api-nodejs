export class AppError extends Error {
    statusCode: number
    constructor(message: string, statusCode = 400) {
        super(message)
        this.statusCode = statusCode
        this.name = this.constructor.name
        Error.captureStackTrace(this, this.constructor)
    }
}


export class UnauthorizedError extends AppError {
    constructor(message = 'Não autenticado') {
        super(message, 401)
    }
}

export class NotFoundError extends AppError {
    constructor(message = 'Não encontrado') {
        super(message, 404)
    }
}

export class BadRequestError extends AppError {
    constructor(message = 'Requisição inválida') {
        super(message, 400)
    }
}

export class ValidationError extends AppError {
    constructor(message = 'Dados inválida') {
        super(message, 400)
    }
}