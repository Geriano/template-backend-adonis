import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Req from 'App/Models/Request'

export default class Request {
  public async handle({ request }: HttpContextContract, next: () => Promise<void>) {
    const ipAddress = request.ip()
    const url = request.url()
    const method = request.method()
    const date = new Date()
    const iso = date => {
      date = new Date(date)
      const iso = date.toISOString()

      return iso.substring(0, iso.length - 5).replace('T', ' ')
    }
    
    const hit = await Req.create({
      ipAddress,
      url,
      method,
      start: new Date().getTime(),
    })

    await Req.query().whereNull('finish').delete()

    await next()

    hit.finish = new Date().getTime()
    await hit.save()

    const diff = (hit.finish - hit.start).toString().padStart(4, ' ')

    console.log(`[${iso(date)}] [${diff}ms] ${ipAddress} - ${method} ${url}`)
  }
}
