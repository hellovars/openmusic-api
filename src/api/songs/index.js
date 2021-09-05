import SongsHandler from './handler'
import routes from './routes'

export default {
  name: 'songs',
  version: '1.0.0',
  register: async (server, { service, validator }) => {
    const songsHandler = new SongsHandler(service, validator)

    server.route(routes(songsHandler))
  }
}
