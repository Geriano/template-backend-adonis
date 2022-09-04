import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import Hash from '@ioc:Adonis/Core/Hash'
import User from 'App/Models/User'

export default class AuthController {
  public async user({ auth }: HttpContextContract) {
    await auth.use('api').authenticate()

    const user = auth.user!
    await user.load('permissions')
    await user.load('roles')
    
    return user
  }

  public async register({ request }: HttpContextContract) {
    const trim = true
    const { name, username, email, password } = await request.validate({
      schema: schema.create({
        name: schema.string({ trim }, [
          rules.required(),
          rules.minLength(2),
          rules.maxLength(255),
        ]),

        username: schema.string({ trim }, [
          rules.required(),
          rules.minLength(4),
          rules.maxLength(255),
          rules.unique({
            table: 'users',
            column: 'username',
          })
        ]),

        email: schema.string({ trim }, [
          rules.required(),
          rules.minLength(6),
          rules.maxLength(255),
          rules.email(),
          rules.unique({
            table: 'users',
            column: 'email',
          })
        ]),

        password: schema.string({ trim }, [
          rules.required(),
          rules.minLength(8),
          rules.maxLength(255),
        ]),

        password_confirmation: schema.string({ trim }, [
          rules.required(),
          rules.equalTo('password'),
        ])
      }),

      messages: {
        'name.required': '{{ field }} is required',
        'name.minLength': '{{ field }} min length is 1',
        'name.maxLength': '{{ field }} max length is 255',
        'username.required': '{{ field }} is required',
        'username.minLength': '{{ field }} min length is 4',
        'username.maxLength': '{{ field }} max length is 255',
        'username.unique': '{{ field }} already taken',
        'email.required': '{{ field }} is required',
        'email.minLength': '{{ field }} min length is 6',
        'email.maxLength': '{{ field }} max length is 255',
        'email.unique': '{{ field }} already taken',
        'password.required': '{{ field }} is required',
        'password.minLength': '{{ field }} min length is 8',
        'password.maxLength': '{{ field }} max length is 255',
        'password_confirmation.required': 'password confirmation is required',
      },
    })

    const user = await User.create({
      name, username, email, password,
    })

    return {
      message: `user ${user.name} has been created`,
    }
  }

  public async login({ auth, request, response }: HttpContextContract) {
    const { username, password } = await request.validate({
      schema: schema.create({
        username: schema.string({ trim: true }, [
          rules.required(),
          rules.minLength(2),
          rules.maxLength(255),
          rules.exists({
            table: 'users',
            column: 'username',
          }),
        ]),
  
        password: schema.string({ trim: true }, [
          rules.required(),
          rules.minLength(8),
          rules.maxLength(255),
        ]),
      }),
    })

    const user = await User.findByOrFail('username', username)

    if (await Hash.verify(user.password, password)) {
      const { type, token, expiresAt, expiresIn } = await auth.use('api').attempt(username, password, {
        expiresIn: '1 day',
      })

      return {
        message: 'authenticated',
        type,
        token,
        expiresAt,
        expiresIn,
      }
    }
    
    return response.unauthorized('Invalid Credentials')
  }

  public async logout({ auth }: HttpContextContract) {
    await auth.use('api').revoke()

    return {
      message: 'token successfully revoked'
    }
  }
}
