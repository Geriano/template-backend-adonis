import { DateTime } from 'luxon'
import Hash from '@ioc:Adonis/Core/Hash'
import { column, beforeSave, BaseModel, manyToMany, ManyToMany } from '@ioc:Adonis/Lucid/Orm'
import Permission from './Superuser/Permission'
import Role from './Superuser/Role'

export default class User extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public name: string

  @column()
  public username: string

  @column()
  public email: string

  @column({ serializeAs: null })
  public password: string

  @column()
  public rememberMeToken?: string

  @column()
  public profilePhotoUrl: string|null;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @manyToMany(() => Permission, {
    pivotTimestamps: true,
  })
  public permissions: ManyToMany<typeof Permission>

  @manyToMany(() => Role, {
    pivotTimestamps: true,
    onQuery: query => query.preload('permissions'),
  })
  public roles: ManyToMany<typeof Role>

  @beforeSave()
  public static async hashPassword (User: User) {
    if (User.$dirty.password) {
      User.password = await Hash.make(User.password)
    }
  }

  public can(abilities: string|string[]|Permission|Permission[]) : boolean {
    if (Array.isArray(abilities)) {
      for (let ability of abilities) {
        if (this.can(ability)) {
          return true;
        }

        return false;
      }
    }

    const permissions = this.roles.reduce((permissions: Permission[], role: Role) => permissions.concat(...role.permissions), this.permissions)
    
    return permissions.find(permission => {
      if (abilities instanceof Permission) {
        return permission.id === abilities.id
      }

      return permission.name === abilities
    }) !== undefined
  }

  public async givePermissionTo(abilities: string|string[]|Permission|Permission[]) {
    let abs: Permission[] = []

    if (Array.isArray(abilities)) {
      const names: string[] = []
      for (let ability of abilities) {
        if (ability instanceof Permission) {
          abs.push(ability)
        } else {
          names.push(ability)
        }
      }
      abs.length && abs.concat(...await Permission.query().whereIn('name', names).exec())
    } else {
      const ab = abilities instanceof Permission ? abilities : await Permission.findBy('name', abilities)

      ab && abs.push(ab)
    }

    const user = await User.find(this.id)
    return await user?.related('permissions').attach(abs.map(ab => ab.id))
  }

  public async revokePermission(abilities: string|string[]|Permission|Permission[]) {
    let abs: Permission[] = []

    if (Array.isArray(abilities)) {
      const names: string[] = []
      for (let ability of abilities) {
        if (ability instanceof Permission) {
          abs.push(ability)
        } else {
          names.push(ability)
        }
      }
      abs.length && abs.concat(...await Permission.query().whereIn('name', names).exec())
    } else {
      const ab = abilities instanceof Permission ? abilities : await Permission.findBy('name', abilities)

      ab && abs.push(ab)
    }

    const user = await User.find(this.id)
    return await user?.related('permissions').detach(abs.map(ab => ab.id))
  }

  public async syncPermission(abilities: string|string[]|Permission|Permission[]) {
    let abs: Permission[] = []

    if (Array.isArray(abilities)) {
      const names: string[] = []
      for (let ability of abilities) {
        if (ability instanceof Permission) {
          abs.push(ability)
        } else {
          names.push(ability)
        }
      }
      abs.length && abs.concat(...await Permission.query().whereIn('name', names).exec())
    } else {
      const ab = abilities instanceof Permission ? abilities : await Permission.findBy('name', abilities)

      ab && abs.push(ab)
    }

    const user = await User.find(this.id)
    return await user?.related('permissions').sync(abs.map(ab => ab.id))
  }

  public hasRole(names: string|string[]|Role|Role[]) : boolean {
    let ns = typeof names === 'string' || names instanceof Role ? [names] : names
    return this.roles.find(role => {
      return ns.map(n => n instanceof Role ? n.name : n)
                .map(n => n.trim().toLocaleLowerCase())
                .includes(role.name)
    }) !== undefined
  }

  public async assignRole(names: string|string[]|Role|Role[]) {
    const roles: Role[] = []

    if (Array.isArray(names)) {
      const rss: string[] = []

      for (let name of names) {
        if (name instanceof Role) {
          roles.push(name)
        } else {
          rss.push(name)
        }
      }

      rss.length && roles.concat(...await Role.query().whereIn('name', rss).exec())
    } else {
      const role = names instanceof Role ? names : await Role.findBy('name', names)

      role && roles.push(role)
    }

    const user = await User.find(this.id)

    return await user?.related('roles').attach(roles.map(role => role.id))
  }

  public async revokeRole(names: string|string[]|Role|Role[]) {
    const roles: Role[] = []

    if (Array.isArray(names)) {
      const rss: string[] = []

      for (let name of names) {
        if (name instanceof Role) {
          roles.push(name)
        } else {
          rss.push(name)
        }
      }

      rss.length && roles.concat(...await Role.query().whereIn('name', rss).exec())
    } else {
      const role = names instanceof Role ? names : await Role.findBy('name', names)

      role && roles.push(role)
    }

    const user = await User.find(this.id)

    return await user?.related('roles').detach(roles.map(role => role.id))
  }

  public async syncRole(names: string|string[]|Role|Role[]) {
    const roles: Role[] = []

    if (Array.isArray(names)) {
      const rss: string[] = []

      for (let name of names) {
        if (name instanceof Role) {
          roles.push(name)
        } else {
          rss.push(name)
        }
      }

      rss.length && roles.concat(...await Role.query().whereIn('name', rss).exec())
    } else {
      const role = names instanceof Role ? names : await Role.findBy('name', names)

      role && roles.push(role)
    }

    const user = await User.find(this.id)

    return await user?.related('roles').sync(roles.map(role => role.id))
  }
}
