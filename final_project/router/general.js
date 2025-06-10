const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post('/register', (req, res) => {
    const { username, password } = req.body;

    // Verifica se username e password foram fornecidos
    if (!username || !password) {
        return res.status(400).json({ message: "Nome de usuário e senha são obrigatórios!" });
    }

    // Verifica se o usuário já existe
    if (users.some(user => user.username === username)) {
        return res.status(409).json({ message: "Nome de usuário já está em uso!" });
    }

    // Cria um novo usuário e adiciona à lista
    users.push({ username, password });

    return res.status(201).json({ message: "Usuário registrado com sucesso!" });
});


// Get the book list available in the shop
public_users.get('/',function (req, res) {
    return res.status(200).json(books);
  });

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
    const { isbn } = req.params; // Obtém o ISBN dos parâmetros da solicitação
    const book = books[isbn]; // Busca o livro pelo ISBN

    if (book) {
        return res.status(200).json(book);
    } else {
        return res.status(404).json({ message: "Livro não encontrado" });
    }
});
  
// Get book details based on author
public_users.get('/author/:author', function (req, res) {
    const author = req.params.author.toLowerCase();
    const booksByAuthor = Object.values(books).filter(book => book.author.toLowerCase() === author);

    if (booksByAuthor.length > 0) {
        res.status(200).json(booksByAuthor);
    } else {
        res.status(404).json({ message: "Nenhum livro encontrado para este autor." });
    }
});


// Get all books based on title
public_users.get('/title/:title', function (req, res) {
    const { title } = req.params;
    const bookByTitle = Object.values(books).find(book => book.title.toLowerCase() === title.toLowerCase());

    if (bookByTitle) {
        return res.status(200).json(bookByTitle);
    } else {
        return res.status(404).json({ message: "Nenhum livro encontrado com este título." });
    }
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
    const { isbn } = req.params;
    const book = books[isbn]; // Busca o livro pelo ISBN

    if (book) {
        return res.status(200).json(book.reviews); // Retorna as avaliações do livro
    } else {
        return res.status(404).json({ message: "Nenhum livro encontrado com este ISBN." });
    }
});


module.exports.general = public_users;
// Note: The above code assumes that the books database is structured as an object with ISBNs as keys.