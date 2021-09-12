import Joi from 'joi'

const PostPlaylistPayloadSchema = Joi.object({
  name: Joi.string().required(),
})

const PostSongPayloadSchema = Joi.object({
  songId: Joi.string().required(),
})

export { PostPlaylistPayloadSchema, PostSongPayloadSchema }
