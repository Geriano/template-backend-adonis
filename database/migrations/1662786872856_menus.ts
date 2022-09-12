import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'menus'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.bigIncrements('id')
            .primary()
      table.bigInteger('parent_id')
            .unsigned()
            .nullable()
            .defaultTo(null)
            .references('id')
            .inTable('menus')
            .onDelete('cascade')
      table.integer('position')
            .unsigned()
      table.string('name')
      table.string('icon')
            .defaultTo('mdi mdi-circle')
      table.string('route_or_url')
      table.json('actives')

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
