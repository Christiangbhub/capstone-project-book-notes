import express from "express";
import pg from "pg";
import bodyParser from "body-parser";
import axios from "axios";

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

//connect database
const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "project",
  password: "chrispostgres",
  port: 5432,
});
db.connect();

async function getBookData() {
  const result = await db.query("SELECT * FROM books ORDER by id");
  return result.rows;
}

async function sortByReview() {
  const result = await db.query("SELECT * FROM books ORDER by review DESC");
  return result.rows;
}

async function sortByDate() {
  const result = await db.query("SELECT * FROM books ORDER by date_read DESC");
  return result.rows;
}

const API_URL = "https://covers.openlibrary.org/b/isbn";

app.get("/", async (req, res) => {
  const books = await getBookData();
  // console.log(books[0]);

  res.render("index.ejs", { books: books });
});

app.get("/add", (req, res) => {
  res.render("add.ejs");
});

app.post("/add", async (req, res) => {
  const book_title = req.body.book_title;
  const review = req.body.review;
  const date_read = req.body.date_read;
  const comment = req.body.comment;
  const isbn = req.body.isbn;

  try {
    const result = await db.query(
      "INSERT INTO books (book_title, review, date_read, comment, isbn) VALUES ($1, $2, $3, $4, $5)",
      [book_title, review, date_read, comment, isbn],
    );
  } catch (error) {
    console.log(error);
  }

  res.redirect("/");
});

app.post("/edit", async (req, res) => {
  const book_id = req.body.updatedItemId;
  const book_title = req.body.updated_book_title;
  const review = req.body.updated_review;
  const date_read = req.body.updated_date_read;
  const comment = req.body.updated_book_comment;
  const isbn = req.body.updated_isbn;

  try {
    const result = await db.query(
      "UPDATE books SET book_title = $1, review = $2, date_read = $3, comment = $4, isbn = $5 where id = $6",
      [book_title, review, date_read, comment, isbn, book_id],
    );
  } catch (error) {
    console.log(error);
  }
  res.redirect("/");
});

app.post("/sort", async (req, res) => {
  const search_filter = req.body.sort_books;
  let sort_data;
  if (search_filter == "review") {
    try {
      sort_data = await sortByReview();
    } catch (error) {
      console.log(error);
    }
  } else {
    try {
      sort_data = await sortByDate();
    } catch (error) {
      console.log(error);
    }
  }
  res.render("index.ejs", { books: sort_data, text: search_filter });
});

app.post("/delete", async (req, res) => {
  const book_id = req.body.itemId;

  try {
    const result = await db.query("DELETE from books WHERE id = $1", [book_id]);
  } catch (error) {
    console.log(error);
  }

  res.redirect("/");
});

app.listen(port, () => {
  console.log(`server running at port ${port}`);
});
