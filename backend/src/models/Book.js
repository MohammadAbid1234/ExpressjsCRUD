import knexConfig from '../../knexfile.js';
import knex from 'knex';

const db = knex(knexConfig.development);

const Book = {
  async getAll() {
    return await db('books').select('*').orderBy('created_at', 'desc');
  },

  async findById(id) {
    return await db('books').where({ id }).first();
  },

  async create(data) {
    const [id] = await db('books').insert(data);
    return id;
  },

  async delete(id) {
    return await db('books').where({ id }).del();
  }
};

export default Book;