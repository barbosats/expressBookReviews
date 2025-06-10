const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')

const auth_users = require("./router/auth_users.js");
const general_routes = require("./router/general.js");

const secretKey = "seuSegredoSuperSeguro"; // Chave para gerar e validar tokens JWT


const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;


const app = express();

// Middleware para permitir JSON nas requisições
app.use(express.json());

// Configuração de sessão
app.use("/customer",session({
    secret:"fingerprint_customer",
    resave: true, 
    saveUninitialized: true
}));


// Middleware de autenticação JWT para rotas protegidas
app.use("/customer/auth/*", function auth(req, res, next) {
    const token = req.headers["authorization"];
    if (!token || !token.startsWith("Bearer ")) {
        return res.status(403).json({ message: "Token necessário para autenticação." });
    }

    jwt.verify(token.split(" ")[1], secretKey, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: "Token inválido!" });
        }
        req.user = decoded; // Armazena usuário autenticado na requisição
        next();
    });
});


// Definição de rotas
app.use("/customer", auth_users.authenticated);
app.use("/", general_routes.general); //Rotas públicas

const PORT =5000;
app.listen(PORT, () => 
console.log("Servidor rodando na porta " + PORT));
