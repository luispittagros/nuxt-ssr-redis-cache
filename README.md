# Nuxt SSR Redis Cache

:rocket: Blazing Fast Server Side Rendering using Redis.

## Setup

```
npm install @luispittagros/nuxt-ssr-redis-cache --save
```

## Usage

In `nuxt.config.js`:

```js
modules: [
   [
      '@luispittagros/nuxt-ssr-redis-cache',
      {
        enabled: true,
        expireTime: 60 * 60,
        client: {
          socket: {
            host:  '127.0.0.1',
            port: 6379,
          },
          password: null,
        },
        matches: [/^\/$/, '/articles/'],
        cacheCleanEndpoint: {
          enabled: false, 
          path: '/ssr-redis-cache',
          cors: '*',
        },
      }
    ]
],
```

or

```js
  modules: ['@luispittagros/nuxt-ssr-redis-cache'],
  ssrRedisCache: {
    enabled: true,
    expireTime: 60 * 60,
    client: {
      socket: {
        host: '127.0.0.1',
        port: 6379,
      },
      password: null,
    },
    matches: [/^\/$/, '/articles/'],
    cacheCleanEndpoint: {
      enabled: true, 
      path: '/ssr-redis-cache',
      cors: '*',
    }
  },
```

##### Redis Client Configuration

For the client configuration check node-redis for reference [here](https://github.com/redis/node-redis/blob/master/docs/client-configuration.md).

##### Cache Clean Endpoint

Creates an endpoint that cleans cached paths, it's useful when you have content that might change often.

To call the endpoint you must make a POST request to your Nuxt appplication using the path you defined (defaults to '/ssr-redis-cache') with the following request body:

```json
{
   "paths" : [ "/", "/example/" ]
}
```

For CORS options check the express cors middleware options [here](https://expressjs.com/en/resources/middleware/cors.html).

### Cached Pages

Cacheable pages have the HTTP response header "X-Cache" which may have a value of "HIT" or "MISS" accordingly.
