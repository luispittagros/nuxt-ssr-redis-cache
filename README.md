# Nuxt SSR Redis Cache

:rocket: Blazing Fast SSR page renderings using Redis.

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
        matches: [/^\/$/, '/articles/']
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
  },
```

For the client configuration check node-redis for reference [here](https://github.com/redis/node-redis/blob/master/docs/client-configuration.md).

### Cached

Cacheable pages have the HTTP response header "X-Cache" which may have a value of "HIT" or "MISS" accordingly.
