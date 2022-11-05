import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class Request extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public ipAddress: string

  @column()
  public url: string

  @column()
  public method: string

  @column()
  public start: number

  @column()
  public finish: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
