import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Req from 'App/Models/Request'

export default class Request {
  public async handle({ request, route }: HttpContextContract, next: () => Promise<void>) {
    const ipAddress = request.ip()
    const url = route?.name || request.url()
    const method = request.method()
    const date = new Date()
    const iso = date => {
      date = new Date(date)
      const iso = date.toISOString()

      return iso.substring(0, iso.length - 5).replace('T', ' ')
    }

    const start = date.getTime()

    await next()

    if (url !== 'request') {
      await Req.create({
        ipAddress,
        url,
        method,
        start,
        finish: new Date().getTime(),
      })
    }

    const diff = (new Date().getTime() - start).toString().padStart(4, ' ')
    console.log(`[${iso(date)}] [${diff}ms] ${ipAddress} - ${method} ${url}`)
  }
}
