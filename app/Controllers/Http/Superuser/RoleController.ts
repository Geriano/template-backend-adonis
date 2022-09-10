import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import Role from 'App/Models/Superuser/Role'

export default class RoleController {
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

    return await Role.query()
                      .orderBy(order?.key || 'name', order?.dir === 'asc' ? 'asc' : 'desc')
                      .where('name', 'like', `%${search || ''}%`)
                      .with('permissions', q => q.where('name', 'like', `%${search}%`))
                      .preload('permissions')
                      .paginate(page, per_page)
  }

  public async store({ auth, request }: HttpContextContract) {
    await auth.use('api').authenticate()

    const { name, permissions } = await request.validate({
      schema: schema.create({
        name: schema.string({ trim: true }, [
          rules.required(),
          rules.maxLength(255),
          rules.unique({
            table: 'roles',
            column: 'name',
          }),
        ]),

        permissions: schema.array().members(schema.number([
          rules.exists({
            table: 'permissions',
            column: 'id',
          }),
        ])),
      })
    })

    try {
      const role = await Role.create({ name })
      await role.related('permissions').attach(permissions)

      return {
        type: 'success',
        message: `role ${role.name} has been created`
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

    let role = await Role.findOrFail(params.role)

    const { name, permissions } = await request.validate({
      schema: schema.create({
        name: schema.string({ trim: true }, [
          rules.required(),
          rules.maxLength(255),
          rules.unique({
            table: 'roles',
            column: 'name',
            whereNot: {
              id: role.id,
            },
          }),
        ]),

        permissions: schema.array().members(schema.number([
          rules.exists({
            table: 'permissions',
            column: 'id',
          }),
        ])),
      })
    })

    try {
      role.name = name
      role = await role.save()
      await role.related('permissions').sync(permissions)

      return {
        type: 'success',
        message: `role ${role.name} has been updated`
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
    const role = await Role.findOrFail(params.role)

    try {
      await role.delete()

      return {
        type: 'success',
        message: `role ${role.name} has been deleted`,
      }
    } catch (e) {
      return {
        type: 'error',
        message: `${e}`,
      }
    }
  }
}
