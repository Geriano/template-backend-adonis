import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'permission_user'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.bigIncrements('id')
            .primary()
      table.bigInteger('permission_id')
            .unsigned()
            .notNullable()
            .references('id')
            .inTable('permissions')
            .onDelete('cascade')
      table.bigInteger('user_id')
            .unsigned()
            .notNullable()
            .references('id')
            .inTable('users')
            .onDelete('cascade')
      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('created_at', { useTz: true })
            .nullable()
      table.timestamp('updated_at', { useTz: true })
            .nullable()
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
