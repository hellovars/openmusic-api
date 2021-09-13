import Hapi from '@hapi/hapi'
import Jwt from '@hapi/jwt'
import Inert from '@hapi/inert'
import dotenv from 'dotenv'
dotenv.config()

import ClientError from './exceptions/ClientError'
import CacheService from './services/redis/CacheService'
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
import { _exports, ProducerService, ExportsValidator } from './modules/exports'
import { uploads, StorageService, UploadsValidator } from './modules/uploads'

const init = async () => {
  const authenticationsService = new AuthenticationsService()
  const cacheService = new CacheService()
  const storageService = new StorageService('./uploads')

  const usersService = new UsersService()
  const songsService = new SongsService()
  const collaborationsService = new CollaborationsService(cacheService)
  const playlistsService = new PlaylistsService(
    collaborationsService,
    cacheService,
  )

  const server = Hapi.server({
    host: process.env.HOST,
    port: process.env.PORT,
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  })

  server.ext('onPreResponse', ({ response }, h) => {
    if (response instanceof ClientError) {
      const newResponse = h.response({
        status: 'fail',
        message: response.message,
      })
      newResponse.code(response.statusCode)
      return newResponse
    }

    return response.continue || response
  })

  await server.register([
    {
      plugin: Jwt,
    },
    {
      plugin: Inert,
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
    {
      plugin: _exports,
      options: {
        service: ProducerService,
        validator: ExportsValidator,
        playlistsService,
      },
    },
    {
      plugin: uploads,
      options: {
        service: storageService,
        validator: UploadsValidator,
      },
    },
  ])

  await server.start()
  console.log(`Server berjalan pada ${server.info.uri}`)
}
init()
