import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'menu_permission'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.bigIncrements('id')
            .primary()
      table.bigInteger('menu_id')
            .unsigned()
            .references('id')
            .inTable('menus')
            .onDelete('cascade')
      table.bigInteger('permission_id')
            .unsigned()
            .references('id')
            .inTable('permissions')
            .onDelete('cascade')

      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
