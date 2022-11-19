import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { string } from '@ioc:Adonis/Core/Helpers'
import Application from '@ioc:Adonis/Core/Application'
import Event from '@ioc:Adonis/Core/Event'
import Hash from '@ioc:Adonis/Core/Hash'
import User from 'App/Models/User'

export default class AuthController {
  public async user({ auth }: HttpContextContract) {
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

    try {
      const user = await User.create({
        name, username, email, password,
      })

      Event.emit('registered', user)
  
      return {
        type: 'success',
        message: `user ${user.name} has been created`,
      }
    } catch (e) {
      return {
        type: 'error',
        message: `${e}`,
      }
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

      Event.emit('login', user)

      await user.load('permissions')
      await user.load('roles')

      return {
        message: 'authenticated',
        user,
        type,
        token,
        expiresAt,
        expiresIn,
      }
    }
    
    return response.unauthorized('Invalid Credentials')
  }

  public async logout({ auth }: HttpContextContract) {
    const user = await auth.use('api').authenticate()
    await auth.use('api').revoke()

    Event.emit('logout', user)

    return {
      type: 'success',
      message: 'token successfully revoked'
    }
  }

  public async updateGeneralInformation({ auth, request }: HttpContextContract) {
    const user: User = await auth.use('api').authenticate(), trim = true
    const { photo, name, username, email } = await request.validate({
      schema: schema.create({
        name: schema.string({ trim }, [
          rules.required(),
          rules.minLength(1),
          rules.maxLength(255),
        ]),

        username: schema.string({ trim }, [
          rules.required(),
          rules.minLength(2),
          rules.maxLength(255),
          rules.unique({
            table: 'users',
            column: 'username',
            caseInsensitive: true,
            whereNot: { id: user.id },
          }),
        ]),

        email: schema.string({ trim }, [
          rules.required(),
          rules.minLength(6),
          rules.maxLength(255),
          rules.unique({
            table: 'users',
            column: 'email',
            caseInsensitive: true,
            whereNot: { id: user.id },
          }),
        ]),

        photo: schema.file.nullableAndOptional({
          extnames: ['jpg', 'jpeg', 'png'],
        }),
      }),
    })

    if (photo && photo.isValid) {
      const filename = string.generateRandom(32)
      const ext = photo.extname || ''
      const path = filename + (ext ? '.' + ext : ext)
      
      await photo.move(Application.publicPath('uploads'), {
        name: path,
        overwrite: true,
      })

      user.profilePhotoUrl = `/uploads/${path}`
    }
    
    user.name = name
    user.username = username
    user.email = email

    if (await user.save()) {
      return {
        message: 'profile successfully updated',
      }
    }

    return {
      message: 'can\'t update profile',
    }
  }

  public async removeProfilePhoto({ auth }: HttpContextContract) {
    const user = await auth.use('api').authenticate()
    user.profilePhotoUrl = null

    if (await user.save()) {
      return {
        message: 'profile photo has been deleted',
      }
    }

    return {
      message: 'can\'t delete profile photo',
    }
  }

  public async updatePassword({ auth, request, response }: HttpContextContract) {
    const user = await auth.use('api').authenticate()
    const { current_password, password } = await request.validate({
      schema: schema.create({
        current_password: schema.string({ trim: true }, [
          rules.required(),
          rules.minLength(8),
          rules.maxLength(255),
        ]),

        password: schema.string({ trim: true }, [
          rules.required(),
          rules.minLength(8),
          rules.maxLength(255),
        ]),

        password_confirmation: schema.string({ trim: true }, [
          rules.required(),
          rules.equalTo('password'),
        ]),
      }),
    })
    
    if (!await Hash.verify(user.password, current_password)) {
      return response.abort({
        errors: [{
          field: 'current_password',
          message: 'wrong password',
        }],
      }, 422)
    }

    user.password = password

    if (await user.save()) {
      return {
        success: true,
        message: 'password has been updated',
      }
    }

    return {
      success: false,
      message: 'can\'t update password',
    }
  }
}
