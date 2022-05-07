const { createClient } = require('redis')
const { serialize, deserialize } = require('./serialize')

export default async function nuxtRedisCache(moduleOptions) {
  const nuxtModuleOptions = Object.assign({}, this.options.redisPageCache, moduleOptions)
  const options = buildOptions(nuxtModuleOptions)

  const client = createClient(options.client)

  client.on('error', function (error) {
    console.log('\x1b[31m%s\x1b[0m', '[Nuxt SSR Redis Cache]: Error: ' + error)
  })

  this.nuxt.hook('ready', async (nuxt) => {
    console.log('')
    console.log('[Nuxt SSR Redis Cache]:', options.enabled ? 'Enabled\x1b[32m ✔' : 'Disabled')

    if (!options.enabled) return

    console.log('\x1b[34m%s\x1b[0m', '[Nuxt SSR Redis Cache]: Connecting to Redis...')

    try {
      await client.connect()
    } catch (error) {
      console.log('\x1b[31m%s\x1b[0m', '[Nuxt SSR Redis Cache]: Unable to connect to Redis: ' + e)
    }

    console.log('\x1b[32m%s\x1b[0m', '[Nuxt SSR Redis Cache]: Connected to Redis!')
  })

  this.nuxt.hook('render:before', async (renderer) => {
    const renderRoute = renderer.renderRoute.bind(renderer)

    renderer.renderRoute = async function (route, context) {
      // Check if the route is cacheable, if not, just render the route (cache-control: no-cache is set when the browser cache is disabled)
      if (!isCacheable(route, options.matches, context.req.headers['cache-control'])) {
        return renderRoute(route, context)
      }

      let value

      try {
        value = await client.get('nuxt/route::' + route)
      } catch (error) {
        console.log(error)
      }

      context.req.hitCache = !!value

      if (!value) {
        return renderRoute(route, context)
      }

      return new Promise(function (resolve) {
        resolve(deserialize(value))
      })
    }
  })

  this.nuxt.hook('render:route', async (url, result, context) => {
    const hitCache = context.req.hitCache

    if (hitCache !== undefined) {
      context.res.setHeader('X-Cache', hitCache ? 'HIT' : 'MISS')
    }

    if (!hitCache && isCacheable(url, options.matches)) {
      client.set('nuxt/route::' + url, serialize(result), {
        EX: options.expireTime,
      })
    }
  })
}

function buildOptions(moduleOptions) {
  const defaultOptions = {
    enabled: true,
    client: {
      socket: {
        host: '127.0.0.1',
        port: 6379,
      },
      password: null,
    },
    expireTime: 60 * 60,
    matches: [],
  }

  return Object.assign({}, defaultOptions, moduleOptions)
}

function isCacheable(url, matches = [], cacheControl = null) {
  return cacheControl !== 'no-cache' && matches.some((path) => (path instanceof RegExp ? path.test(url) : url.startsWith(path)))
}

module.exports.meta = require('../package.json')
