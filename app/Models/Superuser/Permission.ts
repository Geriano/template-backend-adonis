import { DateTime } from 'luxon'
import { BaseModel, afterCreate, column, manyToMany, ManyToMany } from '@ioc:Adonis/Lucid/Orm'
import Role from './Role'
import User from '../User'

export default class Permission extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public name: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @manyToMany(() => User, {
    pivotTimestamps: true
  })
  public users: ManyToMany<typeof User>

  @manyToMany(() => Role, {
    pivotTimestamps: true,
  })
  public roles: ManyToMany<typeof Role>

  @afterCreate()
  public static async giveSuperuserPermission(permission: Permission) {
    const role = await Role.findBy('name', 'superuser')
    await role?.related('permissions').attach([permission.id])
  }
}
