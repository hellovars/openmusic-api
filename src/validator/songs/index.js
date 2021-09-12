import InvariantError from '../../exceptions/InvariantError'
import { SongPayloadSchema } from './schema'

const SongsValidator = {
  validateSongPayload: (payload) => {
    const validationResult = SongPayloadSchema.validate(payload)
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message)
    }
  },
}

export default SongsValidator
