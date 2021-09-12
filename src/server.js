import Hapi from '@hapi/hapi'
import dotenv from 'dotenv'
dotenv.config()
import songs from './api/songs'
import ClientError from './exceptions/ClientError'
import SongsService from './services/postgres/SongsService'
import SongsValidator from './validator/songs'

const init = async () => {
  const songsService = new SongsService()
  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  })

  server.ext('onPreResponse', (request, h) => {
    const { response } = request

    if (response instanceof ClientError) {
      const newResponse = h.response({
        status: 'fail',
        message: response.message,
      })
      newResponse.code(response.statusCode)
      return newResponse
    }

    const newResponse = h.response({
      status: 'error',
      message: 'Maaf, terjadi kegagalan pada server kami.',
    })
    newResponse.code(500)
    console.error(response)

    return response.continue || response
  })

  await server.register({
    plugin: songs,
    options: {
      service: songsService,
      validator: SongsValidator,
    },
  })

  await server.start()
  console.log(`Server berjalan pada ${server.info.uri}`)
}

init()
