import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'permission_role'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.bigIncrements('id')
            .primary()
      table.bigInteger('permission_id')
            .unsigned()
            .references('id')
            .inTable('permissions')
            .onDelete('cascade')
      table.bigInteger('role_id')
            .unsigned()
            .references('id')
            .inTable('roles')
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
