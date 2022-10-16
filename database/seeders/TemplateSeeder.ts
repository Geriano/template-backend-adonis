import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Menu from 'App/Models/Superuser/Menu'
import Permission from 'App/Models/Superuser/Permission'
import Role from 'App/Models/Superuser/Role'
import User from 'App/Models/User'

export default class extends BaseSeeder {
  public permissions = [
    'permission',
    'role',
    'user',
    'menu',
  ]

  public async run () {
    await Role.create({
      name: 'superuser',
    })
    
    for (let permission of this.permissions) {
      for (let ability of ['create', 'read', 'update', 'delete']) {
        await Permission.create({
          name: `${ability} ${permission}`
        })
      }
    }
    
    const user = await User.create({
      name: 'superuser',
      username: 'su',
      email: 'su@local.app',
      password: 'password',
    })

    await user.related('roles').attach([
      (await Role.firstOrFail()).id
    ])

    await this.menus()
  }

  private async menus () {
    const dashboard = await Menu.create({
      name: 'dashboard',
      icon: 'mdi mdi-view-dashboard',
      routeOrUrl: 'home',
    })

    const builtin = await Menu.create({
      name: 'builtin',
      routeOrUrl: '#',
    })

    await builtin.related('permissions')
                  .attach(
                    await Permission.query()
                                    .whereIn('name', [
                                      'read permission',
                                      'read role',
                                      'read user',
                                      'read menu',
                                    ])
                                    .exec()
                                    .then(permissions => permissions.map(permission => permission.id))
                  )

    const permission = await builtin.related('childs')
                                    .create({
                                      name: 'permission',
                                      icon: 'mdi mdi-account-key',
                                      routeOrUrl: 'superuser.permission',
                                    })

    await permission.related('permissions')
                    .attach(
                      await Permission.query()
                                      .whereIn('name', [
                                        'read permission',
                                      ])
                                      .exec()
                                      .then(permissions => permissions.map(permission => permission.id))
                    )

    const role = await builtin.related('childs')
                              .create({
                                name: 'role',
                                icon: 'mdi mdi-account-settings',
                                routeOrUrl: 'superuser.role',
                              })

    await role.related('permissions')
              .attach(
                await Permission.query()
                                .whereIn('name', [
                                  'read role',
                                ])
                                .exec()
                                .then(roles => roles.map(role => role.id))
              )

    const user = await builtin.related('childs')
                              .create({
                                name: 'user',
                                icon: 'mdi mdi-account-group',
                                routeOrUrl: 'superuser.user',
                              })

    await user.related('permissions')
              .attach(
                await Permission.query()
                                .whereIn('name', [
                                  'read user',
                                ])
                                .exec()
                                .then(users => users.map(user => user.id))
              )

    const menu = await builtin.related('childs')
                              .create({
                                name: 'menu',
                                icon: 'mdi mdi-menu',
                                routeOrUrl: 'superuser.menu',
                              })

    await menu.related('permissions')
              .attach(
                await Permission.query()
                                .whereIn('name', [
                                  'read menu',
                                ])
                                .exec()
                                .then(menus => menus.map(menu => menu.id))
              )
  }
}
