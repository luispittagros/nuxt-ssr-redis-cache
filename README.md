# Nuxt SSR Redis Cache

:rocket: Blazing Fast Nuxt Server Side Rendering using Redis. 

Easily improves you Nuxt application performance.

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
        client: {
          socket: {
            host:  '127.0.0.1',
            port: 6379,
          },
          password: null,
        },
        paths: [/^\/$/, '/articles/'], // If empty or "/" is set all pages will be cached
        ttl: 60 * 60, // 1 minute
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
    client: {
      socket: {
        host: '127.0.0.1',
        port: 6379,
      },
      password: null,
    },
    paths: [/^\/$/, '/articles/'], // If empty or "/" is set all pages will be cached
    ttl: 60 * 60, // 1 minute
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

To call the endpoint you must make a POST request to your Nuxt appplication using the path you defined (defaults to '/ssr-redis-cache') with the following JSON request body:

```json
{
   "paths" : [ "/", "/example/" ] // Use "*" as path to delete all cached pages
}
```

For the CORS options check the express cors middleware options [here](https://expressjs.com/en/resources/middleware/cors.html).

### Cached Pages

Cacheable/Cached pages have the HTTP response header "X-Cache" which have the value "HIT" or "MISS" accordingly.
