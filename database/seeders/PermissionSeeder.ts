import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Permission from 'App/Models/Superuser/Permission'

export default class extends BaseSeeder {
  public permissions = [
    'permission',
    'role',
    'user',
  ]

  public async run () {
    // Write your database queries inside the run method
    for (let permission of this.permissions) {
      for (let ability of ['create', 'read', 'update', 'delete']) {
        await Permission.create({
          name: `${ability} ${permission}`
        })
      }
    }
  }
}
