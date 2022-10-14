import * as express from 'express'
import adze from 'adze'

import { models } from './persistence'

const app = express()

app.get('/authors/:id', async ({ params }, res) => {
  const logger = adze().label('Authors')
  const { id } = params
  if (!id) {
    res.sendStatus(400)
    return
  }
  try {
    const author = await models.Author.cache().findByPk(id)
    res.send(author)
  } catch (e) {
    logger.error(e)
    res.sendStatus(500)
  }
})

const port = process.env.port || 3333
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`)
})
server.on('error', console.error)
