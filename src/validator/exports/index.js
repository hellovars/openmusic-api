import { ExportSongsPayloadSchema } from './schema'
import InvariantError from '../../exceptions/InvariantError'

const ExportsValidator = {
  validateExportSongsPayload: (payload) => {
    const validationResult = ExportSongsPayloadSchema.validate(payload)

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message)
    }
  },
}

export default ExportsValidator
