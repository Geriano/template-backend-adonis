import HttpContext from '@ioc:Adonis/Core/HttpContext'
import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, BelongsTo, belongsTo, column, HasMany, hasMany, ManyToMany, manyToMany } from '@ioc:Adonis/Lucid/Orm'
import Permission from './Permission'


export default class Menu extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public parent_id: number|null

  @column()
  public position: number

  @column()
  public name: string

  @column()
  public icon: string

  @column()
  public routeOrUrl: string

  @column({
    serialize: (value: any, attribute: string, model: Menu) => {
      attribute
      model
      return JSON.parse(value)
    },
  })
  public actives: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @manyToMany(() => Permission)
  public permissions: ManyToMany<typeof Permission>

  @hasMany(() => Menu, {
    localKey: 'id',
    foreignKey: 'parent_id',
    onQuery: async query => {
      query.preload('childs')
            .preload('permissions')
            .orderBy('position')

      const ctx = HttpContext.get()!
      const user = ctx.auth.user

      if (!user) return query.doesntHave('permissions')

      await user.load('permissions')
      await user.load('roles')

      const permissions = user.roles.reduce((permissions, role) => [...permissions, ...role.permissions], user.permissions)
                                          .map((permission: Permission) => permission.id)

      query.orDoesntHave('permissions')
            .orWhereHas('permissions', query => query.whereIn('permissions.id', permissions))
    },
  })
  public childs: HasMany<typeof Menu>

  @belongsTo(() => Menu, {
    localKey: 'parent_id',
    foreignKey: 'id',
  })
  public parent: BelongsTo<typeof Menu>

  @beforeCreate()
  public static async generateMenuPosition(menu: Menu) {
    if (menu.position) return
    const position = await Menu.query()
                                .where(query => {
                                  menu.parent_id ? query.where('parent_id', menu.parent_id) : query.whereNull('parent_id')
                                })
                                .count('* as count')
                                .firstOrFail()
                                .then(menu => menu.$extras.count)

    menu.position = position + 1
  }
}
