import { token } from '@hapi/jwt'
import InvariantError from '../exceptions/InvariantError'

const TokenManager = {
  generateAccessToken: (payload) =>
    token.generate(payload, process.env.ACCESS_TOKEN_KEY),
  generateRefreshToken: (payload) =>
    token.generate(payload, process.env.REFRESH_TOKEN_KEY),
  verifyRefreshToken: (refreshToken) => {
    try {
      const artifacts = token.decode(refreshToken)
      token.verifySignature(artifacts, process.env.REFRESH_TOKEN_KEY)
      const { payload } = artifacts.decoded
      return payload
    } catch (error) {
      throw new InvariantError('Refresh token tidak valid')
    }
  },
}

export default TokenManager
