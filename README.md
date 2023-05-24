<h1 align="center">Nuxt SSR Redis Cache</h1>

<p align="center">:rocket: Blazing Fast Nuxt Server Side Rendering using Redis. </p>

<p align="center">:heart: Boost your NuxtJS application's performance with ease and efficiency</p>

## Setup

To install the `nuxt-ssr-redis-cache` module in your project, use the following:

```
npm install @luispittagros/nuxt-ssr-redis-cache --save
```

## Configuration

You can configure `nuxt-ssr-redis-cache` in your `nuxt.config.js` file:

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
        paths: [/^\/$/, '/articles/'], // If empty or "/" is set, all pages will be cached
        ttl: 60 * 60, // 1 hour
        cacheCleanEndpoint: {
          enabled: false, 
          path: '/ssr-redis-cache',
          cors: '*',
        },
      }
    ]
],
```

Alternatively, you can set it up as follows:

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
    paths: [/^\/$/, '/articles/'], // If empty or "/", is set all pages will be cached
    ttl: 60 * 60, // 1 hour
    cacheCleanEndpoint: {
      enabled: true, 
      path: '/ssr-redis-cache',
      cors: '*',
    }
  },
```

##### Redis Client Configuration

For the client configuration, please refer to the comprehensive guide provided by `node-redis`. You can find this reference [here](https://github.com/redis/node-redis/blob/master/docs/client-configuration.md).

##### Cache Clean Endpoint

We provide an endpoint to clear cached paths. This is especially useful if your content changes frequently and needs to be updated on a regular basis.

To utilize this endpoint, send a POST request to your Nuxt application. The default path for this request is `/ssr-redis-cache`. Your request should include the following JSON request body:

```json
{
   "paths" : [ "/", "/example/" ]
}
```

If you need to clear all cached pages, use "*" as your path.

For setting up Cross-Origin Resource Sharing (CORS) options, kindly refer to the express cors middleware options. You can access these options [here](https://expressjs.com/en/resources/middleware/cors.html).

### Understanding Cached Pages

A page is considered 'cacheable' or 'cached' if it has the HTTP response header "X-Cache". This header can carry either "HIT" or "MISS" value, indicating whether the requested data was retrieved from the cache or not.
