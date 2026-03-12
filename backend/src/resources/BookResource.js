export const BookResource = (book) => {
    return {
      idd: book.id,
      book_title: book.title, // Rename keys for the frontend
      written_by: book.author,
      formatted_price: `$${book.price}`,
      is_available: book.stock > 0,
      created_at: book.created_at
    };
  };
  
  // For collections (index)
  export const BookCollection = (books) => books.map(book => BookResource(book));