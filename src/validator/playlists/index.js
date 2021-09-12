import { PostPlaylistPayloadSchema, PostSongPayloadSchema } from './schema'
import InvariantError from '../../exceptions/InvariantError'

const PlaylistsValidator = {
  validatePostPlaylistPayload: (payload) => {
    const validationResult = PostPlaylistPayloadSchema.validate(payload)
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message)
    }
  },
  validatePostSongPayload: (payload) => {
    const validationResult = PostSongPayloadSchema.validate(payload)
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message)
    }
  },
}

export default PlaylistsValidator
