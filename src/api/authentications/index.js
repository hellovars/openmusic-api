import AuthenticationsHandler from './handler'
import routes from './routes'

export default {
  name: 'authentications',
  version: '1.0.0',
  register: async (
    server,
    { authenticationsService, usersService, tokenManager, validator },
  ) => {
    const authenticationsHandler = new AuthenticationsHandler(
      authenticationsService,
      usersService,
      tokenManager,
      validator,
    )
    server.route(routes(authenticationsHandler))
  },
}
