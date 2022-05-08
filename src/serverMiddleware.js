const express = require('express')
const { json } = require('body-parser')
const cors = require('cors')

function ssrRedisCacheMiddleware(client, options = {}) {
  const app = express()

  app.use(json())
  app.use(cors(options.cors || {}))

  app.post('/', async (req, res) => {
    const { paths = [] } = req.body

    if (!paths.length) {
      return res.status(400).json({ error: 'No paths provided' })
    }

    try {
      if (paths.length === 1 && paths[0] === '*') {
        const { keys = [] } = await client.scan(0, { MATCH: 'nuxt/route::*' });
        await Promise.all(keys.map((path) => client.del(path)))
      } else {
        await Promise.all(paths.map((path) => client.del('nuxt/route::' + path)))
      }

      return res.status(200).json({ success: true })
    } catch (error) {
      console.log(error)
    }

    res.status(500).json({ error: 'Something went wrong' })
  })

  return app
}

module.exports = ssrRedisCacheMiddleware
