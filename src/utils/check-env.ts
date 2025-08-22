export function checkEnv(value: string): string {
    const env = process.env[value]

    if (!env) {
        throw new Error(`Env ${value} not found.`)
    }

    return env
}