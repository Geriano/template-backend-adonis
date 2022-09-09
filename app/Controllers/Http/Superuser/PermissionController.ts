import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import Permission from 'App/Models/Superuser/Permission'

export default class PermissionsController {
  public async index({ auth }: HttpContextContract) {
    await auth.use('api').authenticate()

    return await Permission.query().orderBy('name').exec()
  }

  public async store({ auth, request }: HttpContextContract) {
    await auth.use('api').authenticate()

    const { name } = await request.validate({
      schema: schema.create({
        name: schema.string({ trim: true }, [
          rules.required(),
          rules.maxLength(255),
          rules.unique({
            table: 'permissions',
            column: 'name',
          }),
        ])
      })
    })

    try {
      const permission = await Permission.create({ name })

      return {
        type: 'success',
        message: `permission ${permission.name} has been created`
      }
    } catch (e) {
      return {
        type: 'error',
        message: `${e}`,
      }
    }
  }

  public async update({ auth, request, params }: HttpContextContract) {
    await auth.use('api').authenticate()

    const { name } = await request.validate({
      schema: schema.create({
        name: schema.string({ trim: true }, [
          rules.required(),
          rules.maxLength(255),
          rules.unique({
            table: 'permissions',
            column: 'name',
          }),
        ])
      })
    })

    let permission = await Permission.findOrFail(params.permission)

    try {
      permission.name = name
      permission = await permission.save()

      return {
        type: 'success',
        message: `permission ${permission.name} has been created`
      }
    } catch (e) {
      return {
        type: 'error',
        message: `${e}`,
      }
    }
  }

  public async destroy({ auth, params }: HttpContextContract) {
    await auth.use('api').authenticate()
    const permission = await Permission.findOrFail(params.permission)

    try {
      await permission.delete()

      return {
        type: 'success',
        message: `permission ${permission.name} has been deleted`,
      }
    } catch (e) {
      return {
        type: 'error',
        message: `${e}`,
      }
    }
  }
}
