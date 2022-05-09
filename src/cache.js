const { createClient } = require('redis')
const { serialize, deserialize } = require('./serialize')
const ssrRedisCacheMiddleware = require('./serverMiddleware')

export default async function nuxtRedisCache(moduleOptions) {
  const nuxtModuleOptions = Object.assign({}, this.options.ssrRedisCache, moduleOptions)
  const options = buildOptions(nuxtModuleOptions)

  const client = createClient(options.client)

  const cachedHeader = options.cachedHeader === undefined ? 'X-Cache' : options.cachedHeader

  client.on('error', function (error) {
    console.log('\n\x1b[31m%s\x1b[0m', '[Nuxt SSR Redis Cache]: Error: ' + error)
  })

  console.log('\n[Nuxt SSR Redis Cache]:', options.enabled ? 'Enabled \x1b[32m✔' : 'Disabled \x1b[31m✘')

  if (!options.enabled) return

  console.log('\x1b[34m%s\x1b[0m', '[Nuxt SSR Redis Cache]: Connecting to Redis...')

  try {
    await client.connect()
  } catch (error) {
    console.log('\x1b[31m%s\x1b[0m', '[Nuxt SSR Redis Cache]: Unable to connect to Redis: ' + error)
  }

  console.log('\x1b[32m%s\x1b[0m', '[Nuxt SSR Redis Cache]: Connected to Redis!')

  this.nuxt.hook('render:setupMiddleware', () => {
    const isCacheCleanEndpointEnabled = options.cacheCleanEndpoint && options.cacheCleanEndpoint.enabled !== false

    if (isCacheCleanEndpointEnabled) {
      this.addServerMiddleware({
        path: options.cacheCleanEndpoint.path || '/ssr-redis-cache',
        handler: ssrRedisCacheMiddleware(client, options.cacheCleanEndpoint),
      })
    }

    console.log(
      '[Nuxt SSR Redis Cache]:',
      'Cache clean endpoint is ' + (isCacheCleanEndpointEnabled ? 'enabled\x1b[32m ✔' : 'disabled\x1b[31m ✘') + '\n',
    )
  })

  this.nuxt.hook('render:before', async (renderer) => {
    const renderRoute = renderer.renderRoute.bind(renderer)

    renderer.renderRoute = async function (route, context) {
      // Check if the route is cacheable, if not, just render the route (cache-control: no-cache is set when the browser cache is disabled)
      if (!isCacheable(route, options.paths, context.req.headers['cache-control'])) {
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

    if (!hitCache && isCacheable(url, options.paths, context.req.headers['cache-control'])) {
      client.set('nuxt/route::' + url, serialize(result), {
        EX: options.ttl,
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
    ttl: 60 * 60,
    paths: [],
    cachedHeader:
    cacheCleanEndpoint: {
      enabled: false,
      path: '/ssr-redis-cache',
      cors: true,
    },
  }

  return Object.assign({}, defaultOptions, moduleOptions)
}

function isCacheable(url, paths = [], cacheControl = null) {
  return (
    cacheControl !== 'no-cache' && cacheControl !== 'no-store' 
    && (!paths.length || paths.some((path) => (path instanceof RegExp ? path.test(url) : url.startsWith(path))))
  )
}

module.exports.meta = require('../package.json')
