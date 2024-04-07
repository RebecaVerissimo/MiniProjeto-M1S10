const express = require("express");
const yup = require('yup');

const app = express()

app.use(express.json())

const logHoraMiddleware = (req, res, next) => {
    const horaAtual = new Date().toISOString();
    console.log(
      `[${horaAtual}] Nova solicitação recebida para: ${req.method} ${req.originalUrl} ${req.body}`
      );
    next();
};

app.use(logHoraMiddleware);

const schemaAdicionarProduto = yup.object().shape({
    nome: yup.string().required(),
    img: yup.string().url().nullable(),
    descricao: yup.string().required(),
    preco: yup.number().positive().required(),
});

const schemaArray = yup.array().of(schemaAdicionarProduto)
  
const validarAdicionarProduto = async (req, res, next) => {
    const { body } = req;
  
    try {
      await schemaAdicionarProduto.validate(body, { abortEarly: false });
      next(); 
    } catch (erro) {
      res.status(400).json({ erro: erro.errors });
    }
};

const validarAdicionarProdutos = async (req, res, next) => {
    const { body } = req;
    try {
      await schemaArray.validate(body, { abortEarly: false });
      next(); 
    } catch (erro) {
      res.status(400).json({ erro: erro.errors });
    }
};

let produtos = []

app.post("/produtos", validarAdicionarProduto, (req, res) => {
    const {nome, img, decricao, preco} = req.body

    let novoProduto = {nome, img, decricao, preco}

    novoProduto.id = produtos.length > 0 ? produtos[produtos.length - 1].id + 1 : 1;
    produtos.push(novoProduto)

    res.status(201).json(novoProduto)
})

app.post("/produtos-lista", validarAdicionarProdutos, (req, res) => {
    const lista = req.body
    const adicionados = []
    lista.forEach(novoProduto => {
        novoProduto.id = produtos.length > 0 ? produtos[produtos.length - 1].id + 1 : 1;
        produtos.push(novoProduto)
        adicionados.push(novoProduto)
    });
    res.status(201).json(adicionados)
})

app.get("/produtos", (req, res) => {
    res.json(produtos);
});

app.get("/produtos/:id", (req, res) => {
    const { id } = req.params;
    const produto = produtos.find(item => item.id === parseInt(id));
    if (!produto) {
        res.status(404).send("Produto não encontrado.");
        return;
    }
    res.json(produto);
});

app.put('/produtos/:id', (req, res) => {
    const { id } = req.params;
    const newData = req.body;
    const index = produtos.findIndex(item => item.id === parseInt(id));
    if (index === -1) {
        res.status(404).send("Produto não encontrado.");
        return;
    }
    produtos[index] = { ...produtos[index], ...newData };
    res.status(200).json(produtos[index]);
});

app.delete('/produtos/:id', (req, res) => {
    const { id } = req.params;
    const index = produtos.findIndex(item => item.id === parseInt(id));
    if (index === -1) {
        res.status(404).send("Produto não encontrado.");
        return;
    }
    produtos.splice(index, 1);
    res.status(200).send("Produto deletado com sucesso.");
});

app.listen(3000, function(){
    console.log("Servidor Rodando!")
})