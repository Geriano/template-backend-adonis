import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import Request from "App/Models/Request";

export default class RequestMonitoringsController {
  public async index({ request }: HttpContextContract) {
    const avg = (a: number[]) => a.reduce((total, b) => total + b, 0) / a.length
    const urls = await this.urls()
    const requests = await Request.query()
                                  .select('url', 'start', 'finish')
                                  .whereIn('url', urls)
                                  .whereNotNull('finish')
                                  .exec()

    const collections = Object.fromEntries(urls.map(url => [
      url, avg(requests.filter(r => r.url === url).map(r => r.finish - r.start))
    ]))

    return {
      urls: Object.keys(collections),
      times: Object.values(collections),
    }
  }

  public async ips() {
    const requests = await Request.query()
                          .select('ip_address')
                          .distinct()
                          .exec()

    return requests.map(r => r.ipAddress)
  }

  public async methods() {
    const requests = await Request.query()
                          .select('method')
                          .distinct()
                          .exec()

    return requests.map(r => r.method)
  }

  public async urls() {
    const requests = await Request.query()
                          .select('url')
                          .distinct()
                          .exec()

    return requests.map(r => r.url)
  }
}
