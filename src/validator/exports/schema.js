import Joi from 'joi'

const ExportSongsPayloadSchema = Joi.object({
  targetEmail: Joi.string().email({ tlds: true }).required(),
})

export { ExportSongsPayloadSchema }
