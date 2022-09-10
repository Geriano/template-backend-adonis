import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Role from 'App/Models/Superuser/Role'
import User from 'App/Models/User'

export default class extends BaseSeeder {
  public async run () {
    // Write your database queries inside the run method
    const user = await User.create({
      name: 'superuser',
      username: 'su',
      email: 'su@local.app',
      password: 'password',
    })

    await user.related('roles').attach([
      (await Role.firstOrFail()).id
    ])
  }
}
