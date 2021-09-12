import Joi from 'joi'

const PostPlaylistPayloadSchema = Joi.object({
  name: Joi.string().required(),
})

const PostSongPayloadSchema = Joi.object({
  songId: Joi.string().max(50).required(),
})

export { PostPlaylistPayloadSchema, PostSongPayloadSchema }
