import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class UsersSchema extends BaseSchema {
  protected tableName = 'users'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.bigIncrements('id')
            .primary()
      table.string('name', 255)
      table.string('username')
            .unique()
            .notNullable()
            .index()
      table.string('email', 255)
            .notNullable()
            .unique()
      table.string('password', 180)
            .notNullable()
      table.string('remember_me_token')
            .nullable()
      table.string('profile_photo_url')
            .nullable()

      /**
       * Uses timestampz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('created_at', { useTz: true })
            .nullable()
      table.timestamp('updated_at', { useTz: true })
            .nullable()
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
