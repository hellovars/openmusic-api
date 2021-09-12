import UsersHandler from './handler'
import routes from './routes'

export default {
  name: 'users',
  version: '1.0.0',
  register: async (server, { service, validator }) => {
    const usersHandler = new UsersHandler(service, validator)
    server.route(routes(usersHandler))
  },
}
