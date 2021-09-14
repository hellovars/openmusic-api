import { nanoid } from 'nanoid'
import { Pool } from 'pg'
import AuthorizationError from '../../exceptions/AuthorizationError'
import InvariantError from '../../exceptions/InvariantError'
import NotFoundError from '../../exceptions/NotFoundError'

export default class PlaylistsService {
  constructor(collaborationService, cacheService) {
    this._pool = new Pool()
    this._collaborationService = collaborationService
    this._cacheService = cacheService
  }

  async addPlaylist(payload) {
    const id = `playlist-${nanoid(16)}`

    const query = {
      text: 'INSERT INTO playlists VALUES($1, $2, $3) RETURNING id',
      values: [id, ...Object.values(payload)],
    }

    const { rows } = await this._pool.query(query)

    if (!rows[0].id) {
      throw new InvariantError('Playlist gagal ditambahkan')
    }

    return rows[0].id
  }

  async getPlaylists(user) {
    const query = {
      text: `SELECT playlists.id, playlists.name, users.username FROM playlists 
       LEFT JOIN users ON users.id = playlists.owner
       LEFT JOIN collaborations ON playlists.id = collaborations.playlist_id  
       WHERE playlists.owner = $1 OR collaborations.user_id = $1;`,
      values: [user],
    }

    const { rows } = await this._pool.query(query)
    return rows
  }

  async deletePlaylistById(id) {
    const query = {
      text: 'DELETE FROM playlists WHERE id = $1 RETURNING id',
      values: [id],
    }

    const { rowCount } = await this._pool.query(query)
    if (!rowCount) {
      throw new NotFoundError('Playlist gagal dihapus. Id tidak ditemukan')
    }
  }

  async addSongToPlaylist(playlistId, songId) {
    const query = {
      text: 'INSERT INTO playlistsongs (playlist_id, song_id) VALUES($1, $2) RETURNING id',
      values: [playlistId, songId],
    }
    this._cacheService.delete(`playlistsongs:${playlistId}`)

    const { rows } = await this._pool.query(query)
    if (!rows[0].id) {
      throw new InvariantError('Lagu gagal ditambahkan ke playlist')
    }
  }

  async getSongsFromPlaylist(playlistId) {
    try {
      const result = await this._cacheService.get(`playlistsongs:${playlistId}`)
      return JSON.parse(result)
    } catch (error) {
      const query = {
        text: `SELECT songs.id, songs.title, songs.performer
       FROM songs
       JOIN playlistsongs
       ON songs.id = playlistsongs.song_id WHERE playlistsongs.playlist_id = $1`,
        values: [playlistId],
      }

      const { rows } = await this._pool.query(query)

      this._cacheService.set(
        `playlistsongs:${playlistId}`,
        JSON.stringify(rows),
      )
      return rows
    }
  }

  async deleteSongFromPlaylist(playlistId, songId) {
    const query = {
      text: 'DELETE FROM playlistsongs WHERE playlist_id = $1 AND song_id = $2 RETURNING id',
      values: [playlistId, songId],
    }
    this._cacheService.delete(`playlistsongs:${playlistId}`)

    const { rowCount } = await this._pool.query(query)
    if (!rowCount) {
      throw new InvariantError('Lagu gagal dihapus')
    }
  }

  async verifyPlaylistOwner(id, owner) {
    const query = {
      text: 'SELECT owner FROM playlists WHERE id = $1',
      values: [id],
    }

    const { rows, rowCount } = await this._pool.query(query)
    if (!rowCount) {
      throw new NotFoundError('Playlist tidak ditemukan')
    }

    const playlist = rows[0]
    if (playlist.owner !== owner) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini')
    }
  }

  async verifyPlaylistAccess(playlistId, userId) {
    try {
      await this.verifyPlaylistOwner(playlistId, userId)
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error
      }
      try {
        await this._collaborationService.verifyCollaborator(playlistId, userId)
      } catch {
        throw error
      }
    }
  }
}
