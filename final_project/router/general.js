const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Função auxiliar genérica que retorna uma Promise
function getBooksAsync() {
    return new Promise((resolve, reject) => {
        if (books) {
            resolve(books);
        } else {
            reject(new Error("Erro ao buscar os livros."));
        }
    });
}

// GET books by author (com async/await)
public_users.get('/author/:author', async (req, res) => {
    try {
        const booksByAuthor = await getBooksByAuthorAsync(req.params.author);
        res.status(200).json(booksByAuthor);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});

// Função auxiliar para buscar livro por ISBN
function getBookByISBNAsync(isbn) {
    return new Promise((resolve, reject) => {
        const book = books[isbn];
        if (book) {
            resolve(book);
        } else {
            reject(new Error("Livro não encontrado."));
        }
    });
}

// Função auxiliar para buscar livros por autor
function getBooksByAuthorAsync(author) {
    return new Promise((resolve, reject) => {
        const booksByAuthor = Object.values(books).filter(
            (book) => book.author.toLowerCase() === author.toLowerCase()
        );
        resolve(booksByAuthor);
    });
}

// Função auxiliar para buscar livro por título
function getBookByTitleAsync(title) {
    return new Promise((resolve, reject) => {
        const bookByTitle = Object.values(books).find(
            (book) => book.title.toLowerCase() === title.toLowerCase()
        );
        if (bookByTitle) {
            resolve(bookByTitle);
        } else {
            reject(new Error("Nenhum livro encontrado com este título."));
        }
    });
}

// GET book details by title (com async/await)
public_users.get('/title/:title', async (req, res) => {
    try {
        const bookByTitle = await getBookByTitleAsync(req.params.title);
        res.status(200).json(bookByTitle);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});


// Registro de usuário (mantive igual porque não precisa ser assíncrono)
public_users.post('/register', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Nome de usuário e senha são obrigatórios!" });
    }

    if (users.some(user => user.username === username)) {
        return res.status(409).json({ message: "Nome de usuário já está em uso!" });
    }

    users.push({ username, password });
    return res.status(201).json({ message: "Usuário registrado com sucesso!" });
});

// GET all books - agora com async/await
public_users.get('/', async (req, res) => {
    try {
        const livros = await getBooksAsync();
        res.status(200).json(livros);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET book details by ISBN
public_users.get('/isbn/:isbn', async (req, res) => {
    try {
        const book = await getBookByISBNAsync(req.params.isbn);
        res.status(200).json(book);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});

// GET books by author
public_users.get('/author/:author', async (req, res) => {
    try {
        const booksByAuthor = await getBooksByAuthorAsync(req.params.author);
        if (booksByAuthor.length > 0) {
            res.status(200).json(booksByAuthor);
        } else {
            res.status(404).json({ message: "Nenhum livro encontrado para este autor." });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET books by title
public_users.get('/title/:title', async (req, res) => {
    try {
        const bookByTitle = await getBookByTitleAsync(req.params.title);
        res.status(200).json(bookByTitle);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});

// GET reviews by ISBN (mantive síncrono pois não há necessidade de async aqui)
public_users.get('/review/:isbn', function (req, res) {
    const { isbn } = req.params;
    const book = books[isbn];
    if (book) {
        res.status(200).json(book.reviews);
    } else {
        res.status(404).json({ message: "Nenhum livro encontrado com este ISBN." });
    }
});

module.exports.general = public_users;