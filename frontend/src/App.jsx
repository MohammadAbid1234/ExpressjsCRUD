import { useEffect, useMemo, useState } from "react";
import "./App.css";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const initialForm = {
  title: "",
  author: "",
  price: "",
  stock: "",
  publishedYear: "",
};

const moneyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

async function apiRequest(endpoint, options = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });

  if (response.status === 204) {
    return null;
  }

  const text = await response.text();
  let data = null;

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text };
    }
  }

  if (!response.ok) {
    throw new Error(data?.message || "Request failed.");
  }

  return data;
}

function App() {
  const [books, setBooks] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const totalStock = useMemo(
    () => books.reduce((sum, book) => sum + Number(book.stock || 0), 0),
    [books]
  );

  const inventoryValue = useMemo(
    () =>
      books.reduce(
        (sum, book) => sum + Number(book.price || 0) * Number(book.stock || 0),
        0
      ),
    [books]
  );

  async function loadBooks() {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const data = await apiRequest("/books");
      const normalizedBooks = Array.isArray(data)
        ? data
        : Array.isArray(data?.books)
        ? data.books
        : Array.isArray(data?.data)
        ? data.data
        : [];
      setBooks(normalizedBooks);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadBooks();
  }, []);

  function onInputChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function resetForm() {
    setForm(initialForm);
    setEditingId(null);
  }

  function startEdit(book) {
    setEditingId(book.id);
    setSuccessMessage("");
    setErrorMessage("");
    setForm({
      title: book.title || "",
      author: book.author || "",
      price: book.price ?? "",
      stock: book.stock ?? "",
      publishedYear: book.publishedYear ?? "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function buildPayload() {
    return {
      title: form.title,
      author: form.author,
      price: Number(form.price),
      stock: Number(form.stock),
      publishedYear:
        form.publishedYear === "" ? null : Number(form.publishedYear),
    };
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const payload = buildPayload();

      if (editingId) {
        await apiRequest(`/books/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        setSuccessMessage("Book updated.");
      } else {
        await apiRequest("/books", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        setSuccessMessage("Book created.");
      }

      resetForm();
      await loadBooks();
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(book) {
    const confirmed = window.confirm(
      `Delete "${book.title}" by ${book.author}? This action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    setErrorMessage("");
    setSuccessMessage("");

    try {
      await apiRequest(`/books/${book.id}`, { method: "DELETE" });
      setSuccessMessage("Book deleted.");
      await loadBooks();
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  return (
    <div className="app-shell">
      <header className="hero">
        <p className="eyebrow">CRUD Demo</p>
        <h1>Second Bookstore</h1>
        <p className="hero-copy">
          React + Express + MySQL full-stack starter for managing books.
        </p>
      </header>

      <section className="metrics">
        <article className="metric-card">
          <h2>{books.length}</h2>
          <p>Total Titles</p>
        </article>
        <article className="metric-card">
          <h2>{totalStock}</h2>
          <p>Total Units In Stock</p>
        </article>
        <article className="metric-card">
          <h2>{moneyFormatter.format(inventoryValue)}</h2>
          <p>Inventory Value</p>
        </article>
      </section>

      <main className="content-grid">
        <section className="panel">
          <div className="panel-header">
            <h3>{editingId ? "Edit Book" : "Add Book"}</h3>
            {editingId ? (
              <button className="ghost-btn" type="button" onClick={resetForm}>
                Cancel Edit
              </button>
            ) : null}
          </div>

          <form className="book-form" onSubmit={handleSubmit}>
            <label>
              Title
              <input
                name="title"
                value={form.title}
                onChange={onInputChange}
                placeholder="Book title"
                required
              />
            </label>

            <label>
              Author
              <input
                name="author"
                value={form.author}
                onChange={onInputChange}
                placeholder="Author name"
                required
              />
            </label>

            <label>
              Price
              <input
                name="price"
                value={form.price}
                onChange={onInputChange}
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                required
              />
            </label>

            <label>
              Stock
              <input
                name="stock"
                value={form.stock}
                onChange={onInputChange}
                type="number"
                step="1"
                min="0"
                placeholder="0"
                required
              />
            </label>

            <label>
              Published Year
              <input
                name="publishedYear"
                value={form.publishedYear}
                onChange={onInputChange}
                type="number"
                min="1000"
                max={new Date().getFullYear()}
                placeholder="Optional year"
              />
            </label>

            <button className="primary-btn" type="submit" disabled={isSaving}>
              {isSaving
                ? "Saving..."
                : editingId
                ? "Update Book"
                : "Create Book"}
            </button>
          </form>
        </section>

        <section className="panel">
          <div className="panel-header">
            <h3>Books</h3>
            <button className="ghost-btn" type="button" onClick={loadBooks}>
              Refresh
            </button>
          </div>

          {errorMessage ? <p className="alert error">{errorMessage}</p> : null}
          {successMessage ? (
            <p className="alert success">{successMessage}</p>
          ) : null}

          {isLoading ? (
            <p className="loading">Loading books...</p>
          ) : books.length === 0 ? (
            <div className="empty-state">
              <h4>No books yet</h4>
              <p>Create your first entry from the form.</p>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Author</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Year</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {books.map((book) => (
                    <tr key={book.id}>
                      <td>{book.title}</td>
                      <td>{book.author}</td>
                      <td>{moneyFormatter.format(Number(book.price || 0))}</td>
                      <td>{book.stock}</td>
                      <td>{book.publishedYear || "-"}</td>
                      <td className="actions">
                        <button type="button" onClick={() => startEdit(book)}>
                          Edit
                        </button>
                        <button
                          type="button"
                          className="danger-btn"
                          onClick={() => handleDelete(book)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
