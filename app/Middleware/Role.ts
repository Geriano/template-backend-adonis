import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class Role {
  public async handle({ auth, response }: HttpContextContract, next: () => Promise<void>, guards: string[]) {
    const user = await auth.authenticate()
    await user.load('roles')

    if (!user.hasRole(guards)) {
      return response.unauthorized()
    }

    // code for middleware goes here. ABOVE THE NEXT CALL
    await next()
  }
}
