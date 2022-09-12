import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import Menu from 'App/Models/Superuser/Menu'
import Permission from 'App/Models/Superuser/Permission'

export default class MenuController {
  public async index({ auth }: HttpContextContract) {
    const user = await auth.use('api').authenticate()
    await user.load('permissions')
    await user.load('roles')

    Menu.user = user

    const permissions = user.roles.reduce((permissions, role) => [...permissions, ...role.permissions], user.permissions)
                                  .map((permission: Permission) => permission.id)

    const query = Menu.query()
                      .whereNull('parent_id')
                      .where(query => {
                        query.orDoesntHave('permissions')
                              .orWhereHas('permissions', query => query.whereIn('permissions.id', permissions))
                      })
                      .orderBy('position')
                      .preload('childs')

    return await query.exec()
  }

  public async store({ request }: HttpContextContract) {
    const { name, icon, route_or_url, actives } = await request.validate({
      schema: schema.create({
        name: schema.string({ trim: true, }, [
          rules.required(),
          rules.maxLength(255),
        ]),

        icon: schema.string.optional({ trim: true }, [
          rules.maxLength(255),
        ]),

        route_or_url: schema.string({ trim: true }, [
          rules.required(),
          rules.maxLength(255),
        ]),

        actives: schema.array.optional().members(schema.string({ trim: true }, [
          rules.maxLength(255),
        ])),
      }),
    })

    const menu = await Menu.create({ name, icon: icon || 'mdi mdi-circle', routeOrUrl: route_or_url, actives: JSON.stringify(actives || []) })

    if (menu) {
      return {
        type: 'success',
        message: `menu ${menu.name} has been created`,
      }
    }

    return {
      type: 'error',
      message: `can't create menu`,
    }
  }

  public async update({ request, params }: HttpContextContract) {
    const menu = await Menu.findOrFail(params.menu)

    const { name, icon, route_or_url, actives } = await request.validate({
      schema: schema.create({
        name: schema.string({ trim: true, }, [
          rules.required(),
          rules.maxLength(255),
        ]),

        icon: schema.string.optional({ trim: true }, [
          rules.maxLength(255),
        ]),

        route_or_url: schema.string({ trim: true }, [
          rules.required(),
          rules.maxLength(255),
        ]),

        actives: schema.array.optional().members(schema.string({ trim: true }, [
          rules.maxLength(255),
        ])),
      }),
    })

    menu.name = name
    menu.icon = icon || 'mdi mdi-circle'
    menu.routeOrUrl = route_or_url
    menu.actives = JSON.stringify(actives || [])

    if (await menu.save()) {
      return {
        type: 'success',
        message: `menu ${menu.name} has been updated`,
      }
    }

    return {
      type: 'error',
      message: `can't update menu`,
    }
  }

  public async destroy({ params }: HttpContextContract) {
    const menu = await Menu.findOrFail(params.menu)

    try {
      await menu.delete()

      return {
        type: 'success',
        message: `menu ${menu.name} has been deleted`,
      }
    } catch (e) {
      return {
        type: 'error',
        message: `can't delete menu`,
      }
    }
  }

  public async save({ request }: HttpContextContract) {
    const { menus } = request.body()

    const flatMap = menu => {
      const { id, name, icon, parent_id, position, childs } = menu

      if (childs?.length) {
        return childs.flatMap(flatMap)
      }

      return [
        {
          id, name, icon, parent_id, position,
        },
      ]
    }

    const position = (menus, parent_id = null) => {
      let i = 0

      return menus.map(menu => ({
        ...menu,
        position: ++i,
        parent_id: parent_id,
        childs: position(menu.childs || [], menu.id),
      }))
    }

    const result = position(menus).flatMap(flatMap)

    for (const m of result) {
      await Menu.query().where('id', m.id).update({
        parent_id: m.parent_id,
        position: m.position,
      }).exec()
    }

    return position(menus)
  }
}
