import Joi from 'joi'

const CollaborationPayloadSchema = Joi.object({
  playlistId: Joi.string().max(50).required(),
  userId: Joi.string().max(50).required(),
})

export { CollaborationPayloadSchema }
