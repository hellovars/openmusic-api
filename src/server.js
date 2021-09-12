import Hapi from '@hapi/hapi'
import Jwt from '@hapi/jwt'
import dotenv from 'dotenv'
dotenv.config()

import ClientError from './exceptions/ClientError'
import { songs, SongsService, SongsValidator } from './modules/songs'
import { users, UsersService, UsersValidator } from './modules/users'
import {
  authentications,
  AuthenticationsService,
  AuthenticationsValidator,
  TokenManager,
} from './modules/authentications'
import {
  playlists,
  PlaylistsService,
  PlaylistsValidator,
} from './modules/playlists'
import {
  collaborations,
  CollaborationsService,
  CollaborationsValidator,
} from './modules/collaborations'

const init = async () => {
  const authenticationsService = new AuthenticationsService()
  const usersService = new UsersService()
  const songsService = new SongsService()
  const collaborationsService = new CollaborationsService()
  const playlistsService = new PlaylistsService(collaborationsService)

  const server = Hapi.server({
    host: process.env.HOST,
    port: process.env.PORT,
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

    return response.continue || response
  })

  // Jwt Plugin
  await server.register([
    {
      plugin: Jwt,
    },
  ])

  server.auth.strategy('openmusic_jwt', 'jwt', {
    keys: process.env.ACCESS_TOKEN_KEY,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: process.env.ACCESS_TOKEN_AGE,
    },
    validate: (artifacts) => ({
      isValid: true,
      credentials: {
        id: artifacts.decoded.payload.id,
      },
    }),
  })

  // Plugins
  await server.register([
    {
      plugin: authentications,
      options: {
        authenticationsService,
        usersService,
        tokenManager: TokenManager,
        validator: AuthenticationsValidator,
      },
    },
    {
      plugin: users,
      options: {
        service: usersService,
        validator: UsersValidator,
      },
    },
    {
      plugin: songs,
      options: {
        service: songsService,
        validator: SongsValidator,
      },
    },
    {
      plugin: playlists,
      options: {
        service: playlistsService,
        validator: PlaylistsValidator,
      },
    },
    {
      plugin: collaborations,
      options: {
        collaborationsService,
        playlistsService,
        validator: CollaborationsValidator,
      },
    },
  ])

  await server.start()
  console.log(`Server berjalan pada ${server.info.uri}`)
}
init()
