import { ImageHeadersSchema } from './schema'
import InvariantError from '../../exceptions/InvariantError'

const UploadsValidator = {
  validateImageHeaders: (headers) => {
    const validationResult = ImageHeadersSchema.validate(headers)

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message)
    }
  },
}

export default UploadsValidator
