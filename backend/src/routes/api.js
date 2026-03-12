import express from "express";
import * as BookController from "../controllers/BookController.js";
import { validateBookStore } from "../middleware/requests/bookRequest.js";

const router = express.Router();

router.get("/books", BookController.index);
router.get("/books/:id", BookController.show);
router.post("/books", validateBookStore, BookController.store);

export default router;

