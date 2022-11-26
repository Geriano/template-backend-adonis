import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database';

import Request from "App/Models/Request";

export default class RequestMonitoringsController {
  public async index({ request }: HttpContextContract) {
    const avg = (a: number[]) => a.reduce((total, b) => total + b, 0) / a.length
    const urls = await this.urls()

    if (urls.length === 0) {
      return {
        urls: [],
        times: [],
      }
    }

    const requests = await Request.query()
                                  .select('url', 'start', 'finish')
                                  .whereIn('url', urls)
                                  .whereNotNull('finish')
                                  .exec()

    const query = urls.map(url => {
      const name = url.replace(/\/|\.|\-/g, '_')
      return `(SELECT COUNT(*) FROM requests WHERE url = ?) as ${name}`
    }).join(',')
    
    const countResult = await Database.rawQuery(`SELECT ${query}`, urls).exec()
    const count = JSON.parse(JSON.stringify(countResult[0][0])) as {
      [key in typeof urls as string]: number
    }

    const collections = Object.fromEntries(urls.map(url => {
      const c = count[url.replace(/\/|\.|\-/g, '_')]
      return [
        `${url}`, {
          time: requests.filter(r => r.url === url).map(r => r.finish - r.start),
          count: c,
        },
      ]
    }))

    return {
      urls: Object.keys(collections),
      times: Object.values(collections).map(collection => collection.time),
      counts: Object.values(collections).map(collection => collection.count),
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
