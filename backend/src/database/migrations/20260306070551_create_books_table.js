
export const up = function(knex) {
    return knex.schema.createTable('books', (table) => {
      table.increments('id').primary();
      table.string('title').notNullable();
      table.string('author').notNullable();
      table.decimal('price', 10, 2).notNullable();
      table.integer('stock').defaultTo(0);
      table.integer('publishedYear').defaultTo(0);
      table.timestamp('created_at').defaultTo(knex.fn.now());
      
      
      // Senior move: Adding an index for faster searching by title
      table.index(['title']); 
    });
  };
  
  export const down = function(knex) {
    return knex.schema.dropTableIfExists('books');
  };



