import CollaborationsHandler from './handler'
import routes from './routes'

export default {
  name: 'collaborations',
  version: '1.0.0',
  register: async (
    server,
    { collaborationsService, playlistsService, validator },
  ) => {
    const collaborationsHandler = new CollaborationsHandler(
      collaborationsService,
      playlistsService,
      validator,
    )
    server.route(routes(collaborationsHandler))
  },
}
