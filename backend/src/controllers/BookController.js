import Book from '../models/Book.js';
import { BookResource, BookCollection } from '../resources/BookResource.js';

export const index = async (req, res) => {
  try {
    const books = await Book.getAll();
    res.json({ data: (books) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const store = async (req, res) => {
  try {
    const id = await Book.create(req.body);
    const newBook = await Book.findById(id);
    res.status(201).json({ 
      message: "Book created successfully",
      data: BookResource(newBook) 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const show = async (req, res) => {
  const book = await Book.findById(req.params.id);
  if (!book) return res.status(404).json({ message: "Book not found" });
  res.json({ data: BookResource(book) });
};













// security - helmet, cors, express-rate-limit.
// data validation - zod
// logging/debugging - winston, morgan
// performance - compression
// database - prisma (if you want typesafe orm with an intuitive query builder, migrations and prisma client for working with db easy), drizzle - if you want lightweight sql first orm with focus on performance you can write raw sql while still getting type safety.
// Kysely is a good alternative to Drizzle.

// 




