import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Menu from 'App/Models/Superuser/Menu'
import Permission from 'App/Models/Superuser/Permission'

export default class extends BaseSeeder {
  public async run () {
    // Write your database queries inside the run method
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
