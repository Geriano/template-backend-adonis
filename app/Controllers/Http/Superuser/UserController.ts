import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import User from 'App/Models/User'

export default class UserController {
  public async index({ auth, request }: HttpContextContract) {
    await auth.use('api').authenticate()

    const { page, per_page, search, order } = await request.validate({
      schema: schema.create({
        page: schema.number([
          rules.required(),
        ]),
        per_page: schema.number([
          rules.required(),
        ]),
        search: schema.string.optional({ trim: true }),
        order: schema.object.optional().members({
          key: schema.string.optional({ trim: true }),
          dir: schema.enum.optional(['asc', 'desc']),
        }),
      }),
    })

    return await User.query()
                      .orderBy(order?.key || 'name', order?.dir === 'asc' ? 'asc' : 'desc')
                      .where(query => {
                        const s = `%${search || ''}%`
                        query.where('name', 'like', s)
                              .orWhere('username', 'like', s)
                              .orWhere('email', 'like', s)
                      })
                      .with('roles', query => query.where('name', 'like', `%${search}%`))
                      .preload('roles')
                      .paginate(page, per_page)
  }

  public async store({ auth, request }: HttpContextContract) {
    await auth.use('api').authenticate()

    const { name, username, email, password, roles } = await request.validate({
      schema: schema.create({
        name: schema.string({ trim: true }, [
          rules.required(),
          rules.maxLength(255),
        ]),

        username: schema.string({ trim: true }, [
          rules.required(),
          rules.maxLength(255),
          rules.unique({
            table: 'users',
            column: 'username',
          }),
        ]),

        email: schema.string({ trim: true }, [
          rules.required(),
          rules.maxLength(255),
          rules.unique({
            table: 'users',
            column: 'email',
          }),
        ]),

        password: schema.string({ trim: true }, [
          rules.required(),
          rules.minLength(8),
          rules.maxLength(255),
        ]),

        password_confirmation: schema.string({ trim: true }, [
          rules.equalTo('password'),
        ]),

        roles: schema.array().members(schema.number([
          rules.exists({
            table: 'roles',
            column: 'id',
          }),
        ])),
      })
    })

    try {
      const user = await User.create({ name, username, email, password })
      await user.related('roles').attach(roles)

      return {
        type: 'success',
        message: `user ${user.name} has been created`
      }
    } catch (e) {
      return {
        type: 'error',
        message: `${e}`,
      }
    }
  }

  public async update({ auth, request, params }: HttpContextContract) {
    await auth.use('api').authenticate()

    let user = await User.findOrFail(params.user)

    const { name, username, email, password, roles } = await request.validate({
      schema: schema.create({
        name: schema.string({ trim: true }, [
          rules.required(),
          rules.maxLength(255),
        ]),

        username: schema.string({ trim: true }, [
          rules.required(),
          rules.maxLength(255),
          rules.unique({
            table: 'users',
            column: 'username',
            whereNot: {
              id: user.id,
            },
          }),
        ]),

        email: schema.string({ trim: true }, [
          rules.required(),
          rules.maxLength(255),
          rules.unique({
            table: 'users',
            column: 'email',
            whereNot: {
              id: user.id,
            },
          }),
        ]),

        password: schema.string({ trim: true }, [
          rules.required(),
          rules.minLength(8),
          rules.maxLength(255),
        ]),

        password_confirmation: schema.string({ trim: true }, [
          rules.equalTo('password'),
        ]),

        roles: schema.array().members(schema.number([
          rules.exists({
            table: 'roles',
            column: 'id',
          }),
        ])),
      })
    })

    try {
      user.name = name
      user.username = username
      user.email = email
      user.password = password
      user = await user.save()
      await user.related('roles').sync(roles)

      return {
        type: 'success',
        message: `user ${user.name} has been updated`
      }
    } catch (e) {
      return {
        type: 'error',
        message: `${e}`,
      }
    }
  }

  public async destroy({ auth, params }: HttpContextContract) {
    await auth.use('api').authenticate()
    const user = await User.findOrFail(params.user)

    try {
      await user.delete()

      return {
        type: 'success',
        message: `user ${user.name} has been deleted`,
      }
    } catch (e) {
      return {
        type: 'error',
        message: `${e}`,
      }
    }
  }
}
