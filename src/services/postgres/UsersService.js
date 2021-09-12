import { compare, hash } from 'bcrypt'
import { nanoid } from 'nanoid'
import { Pool } from 'pg'
import AuthenticationError from '../../exceptions/AuthenticationError'
import InvariantError from '../../exceptions/InvariantError'
import NotFoundError from '../../exceptions/NotFoundError'

export default class UsersService {
  constructor() {
    this._pool = new Pool()
  }

  async addUser({ username, password, fullname }) {
    await this.verifyNewUsername(username)
    const id = `user-${nanoid(16)}`
    const hashedPassword = await hash(password, 10)
    const query = {
      text: 'INSERT INTO users VALUES($1, $2, $3, $4) RETURNING id',
      values: [id, username, hashedPassword, fullname],
    }

    const { rows, rowCount } = await this._pool.query(query)

    if (!rowCount) {
      throw new InvariantError('User gagal ditambahkan')
    }
    return rows[0].id
  }

  async verifyNewUsername(username) {
    const query = {
      text: 'SELECT username FROM users WHERE username = $1',
      values: [username],
    }

    const { rowCount } = await this._pool.query(query)

    if (rowCount) {
      throw new InvariantError(
        'Gagal menambahkan user. Username sudah digunakan.',
      )
    }
  }

  async getUserById(userId) {
    const query = {
      text: 'SELECT id, username, fullname FROM users WHERE id = $1',
      values: [userId],
    }

    const { rows, rowCount } = await this._pool.query(query)

    if (!rowCount) {
      throw new NotFoundError('User tidak ditemukan')
    }

    return rows[0]
  }

  async getUsersByUsername(username) {
    const query = {
      text: 'SELECT id, username, fullname FROM users WHERE username LIKE $1',
      values: [`%${username}%`],
    }
    const { rows } = await this._pool.query(query)
    return rows
  }

  async verifyUserCredential(username, password) {
    const query = {
      text: 'SELECT id, password FROM users WHERE username = $1',
      values: [username],
    }

    const { rows, rowCount } = await this._pool.query(query)

    if (!rowCount) {
      throw new AuthenticationError('Kredensial yang Anda berikan salah')
    }

    const { id, password: hashedPassword } = rows[0]

    const match = await compare(password, hashedPassword)
    if (!match) {
      throw new AuthenticationError('Kredensial yang Anda berikan salah')
    }

    return id
  }
}
