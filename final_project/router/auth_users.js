const express = require('express');
const jwt = require('jsonwebtoken');
const regd_users = express.Router();

let books = require("./booksdb.js");
let users = []; // Lista de usuários registrados

const secretKey = "seuSegredoSuperSeguro";

// Função para registrar usuários
function registerUser(username, password) {
    users.push({ username, password });
}

// Função para verificar credenciais de usuário
const authenticatedUser = (username, password) => {
    return users.some(user => user.username === username && user.password === password);
};

// Implementação do login
regd_users.post("/login", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Nome de usuário e senha são obrigatórios!" });
    }

    if (!authenticatedUser(username, password)) {
        return res.status(401).json({ message: "Credenciais inválidas! Verifique seu nome de usuário e senha." });
    }

    const token = jwt.sign({ username }, secretKey, { expiresIn: '1h' });
    return res.status(200).json({ message: "Login bem-sucedido!", token });
});

// Registro de usuário
regd_users.post("/register", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Nome de usuário e senha são obrigatórios!" });
    }

    if (users.some(user => user.username === username)) {
        return res.status(409).json({ message: "Nome de usuário já está em uso!" });
    }

    registerUser(username, password);
    return res.status(201).json({ message: "Usuário registrado com sucesso!" });
});

// Adicionar ou modificar resenha de livro
regd_users.put("/auth/review/:isbn", (req, res) => {
    const { isbn } = req.params;
    const { review } = req.body;

    if (!req.user || !req.user.username) {
        return res.status(403).json({ message: "Usuário não autenticado! Faça login para adicionar uma resenha." });
    }

    const username = req.user.username;

    if (!books[isbn]) {
        return res.status(404).json({ message: "Livro não encontrado." });
    }

    if (!books[isbn].reviews) {
        books[isbn].reviews = {};
    }

    books[isbn].reviews[username] = review;

    return res.status(200).json({ message: "Resenha salva com sucesso!", reviews: books[isbn].reviews });
});

// **Excluir resenha de livro**
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const { isbn } = req.params;
    const username = req.user?.username; // Obtém o usuário autenticado

    if (!username) {
        return res.status(403).json({ message: "Usuário não autenticado! Faça login para excluir uma resenha." });
    }

    if (!books[isbn] || !books[isbn].reviews) {
        return res.status(404).json({ message: "Resenha não encontrada para esse livro." });
    }

    if (books[isbn].reviews[username]) {
        delete books[isbn].reviews[username];
        return res.status(200).json({ message: "Resenha excluída com sucesso!" });
    } else {
        return res.status(403).json({ message: "Você só pode excluir sua própria resenha!" });
    }
});

module.exports.authenticated = regd_users;
module.exports.users = users;
