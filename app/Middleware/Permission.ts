import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class Permission {
  public async handle({ auth, response }: HttpContextContract, next: () => Promise<void>, guards: string[]) {
    const user = await auth.authenticate()
    await user.load('permissions')
    await user.load('roles')

    if (!user.can(guards)) {
      return response.unauthorized()
    }

    // code for middleware goes here. ABOVE THE NEXT CALL
    await next()
  }
}
