export default class ExportsHandler {
  constructor(service, validator, playlistsService) {
    this._service = service
    this._validator = validator
    this._playlistsService = playlistsService

    this.postExportSongsHandler = this.postExportSongsHandler.bind(this)
  }

  async postExportSongsHandler({ auth, params, payload }, h) {
    this._validator.validateExportSongsPayload(payload)

    const { playlistId } = params
    const { id: userId } = auth.credentials

    await this._playlistsService.verifyPlaylistAccess(playlistId, userId)

    const message = {
      playlistId,
      targetEmail: payload.targetEmail,
    }

    await this._service.sendMessage('export:songs', JSON.stringify(message))

    const response = h.response({
      status: 'success',
      message: 'Permintaan Anda sedang kami proses',
    })
    response.code(201)
    return response
  }
}
