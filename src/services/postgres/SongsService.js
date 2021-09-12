import { nanoid } from 'nanoid'
import { Pool } from 'pg'
import InvariantError from '../../exceptions/InvariantError'
import NotFoundError from '../../exceptions/NotFoundError'
import { mapDBToModel } from '../../utils'

export default class SongsService {
  constructor() {
    this._pool = new Pool()
  }

  async addSong(payload) {
    const id = `song-${nanoid(16)}`
    const insertedAt = new Date().toISOString()
    const query = {
      text: 'INSERT INTO songs VALUES($1, $2, $3, $4, $5, $6, $7, $7) RETURNING id',
      values: [id, ...Object.values(payload), insertedAt],
    }
    const { rows } = await this._pool.query(query)

    if (!rows[0].id) {
      throw new InvariantError('Lagu gagal ditambahkan')
    }

    return rows[0].id
  }

  async getSongs() {
    const { rows } = await this._pool.query(
      'SELECT id, title, performer FROM songs',
    )
    return rows
  }

  async getSongById(id) {
    const query = {
      text: 'SELECT * FROM songs WHERE id = $1',
      values: [id],
    }
    const { rows, rowCount } = await this._pool.query(query)

    if (!rowCount) {
      throw new NotFoundError('Lagu tidak ditemukan')
    }

    return rows.map(mapDBToModel)[0]
  }

  async editSongById(id, payload) {
    const updatedAt = new Date().toISOString()
    const query = {
      text: 'UPDATE songs SET title = $1, year = $2, performer = $3, genre = $4, duration = $5, updated_at = $6 WHERE id = $7 RETURNING id',
      values: [...Object.values(payload), updatedAt, id],
    }
    const { rowCount } = await this._pool.query(query)

    if (!rowCount) {
      throw new NotFoundError('Gagal memperbarui lagu. Id tidak ditemukan')
    }
  }

  async deleteSongById(id) {
    const query = {
      text: 'DELETE FROM songs WHERE id = $1 RETURNING id',
      values: [id],
    }
    const { rowCount } = await this._pool.query(query)

    if (!rowCount) {
      throw new NotFoundError('Lagu gagal dihapus. Id tidak ditemukan')
    }
  }
}
