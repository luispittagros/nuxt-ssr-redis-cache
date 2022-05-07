const express = require('express')
const { json } = require('body-parser')
const cors = require('cors')

function ssrRedisCacheMiddleware(redisClient, options = {}) {
  const app = express()

  app.use(json())
  app.use(cors(options.cors || {}))

  app.post(options.path || '/ssr-redis-cache', async (req, res) => {
    const { paths = [] } = req.body

    if (!paths.length) {
      return res.status(400).json({ error: 'No paths provided' })
    }

    try {
      await Promise.all(paths.map((path) => redisClient.del('nuxt/route::' + path)))

      return res.status(200).json({ success: true })
    } catch (error) {
      console.log(error)
    }

    res.status(500).json({ error: 'Something went wrong' })
  })

  return app
}

module.exports = ssrRedisCacheMiddleware
