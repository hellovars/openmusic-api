import ExportsHandler from './handler'
import routes from './routes'

export default {
  name: 'exports',
  version: '1.0.0',
  register: async (server, { service, validator, playlistsService }) => {
    const exportsHandler = new ExportsHandler(
      service,
      validator,
      playlistsService,
    )
    server.route(routes(exportsHandler))
  },
}
