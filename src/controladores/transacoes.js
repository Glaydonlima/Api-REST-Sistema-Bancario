const db = require("../data/db");
const {
  validarId,
  validarCampos,
  validarTipo,
  validarValor,
  formataString,
  validarCategoria,
} = require("../utils/utils-transacoes");

const cadastrarTransacao = async (req, res) => {
  try {
    const { descricao, valor, data, categoria_id, tipo } = req.body;

    validarCampos(
      [descricao, valor, data, categoria_id, tipo],
      "Todos os campos devem ser preenchidos"
    );
    validarTipo(tipo);
    validarValor(valor);
    await validarCategoria(categoria_id);

    const transacao = await db.cadastrarTransacao(
      descricao,
      valor,
      data,
      categoria_id,
      req.usuario.id,
      tipo
    );

    const categoriaTransacao = await db.pegarCategoriaPorId(categoria_id);

    const arrayResposta = {
      id: transacao.id,
      tipo: transacao.tipo,
      descricao: transacao.descricao,
      valor: transacao.valor,
      data: transacao.data,
      usuario_id: transacao.usuario_id,
      categoria_id: transacao.categoria_id,
      categoria_nome: categoriaTransacao.descricao,
    };
    return res.status(201).json(arrayResposta);
  } catch (error) {
    let statusCode;
    let errorMessage;
    switch (error.message) {
      case "Todos os campos devem ser preenchidos":
      case "Campo tipo deve ser informado corretamente":
      case "Campo valor deve ser informado corretamente":
      case "O ID deve ser um número positivo":
      case "A categoria informada não existe":
        statusCode = 400;
        errorMessage = error.message;
        break;
      default:
        statusCode = 500;
        errorMessage = "Erro interno do servidor";
        break;
    }
    return res.status(statusCode).json({ mensagem: errorMessage });
  }
};

const modificarTransacao = async (req, res) => {
  try {
    const { id } = req.params;
    const { descricao, valor, data, categoria_id, tipo } = req.body;

    validarCampos(
      [descricao, valor, data, categoria_id, tipo],
      "Todos os campos devem ser preenchidos"
    );
    const pegarTransacao = await db.pegarTransacaoPorId(id);

    if (!pegarTransacao) {
      return res.status(400).json({
        mensagem: "Transação não encontrada.",
      });
    }

    if (pegarTransacao.usuario_id !== req.usuario.id) {
      return res.status(400).json({
        mensagem: "Você não tem autorização para alterar essa transação",
      });
    }

    validarTipo(tipo);
    validarValor(valor);
    await validarCategoria(categoria_id);

    await db.modificarTransacao(id, descricao, valor, data, categoria_id, tipo);

    return res.status(204).send();
  } catch (error) {
    let statusCode;
    let errorMessage;
    switch (error.message) {
      case "Todos os campos devem ser preenchidos":
      case "Campo tipo deve ser informado corretamente":
      case "Campo valor deve ser informado corretamente":
      case "O ID deve ser um número positivo":
      case "A categoria informada não existe":
        statusCode = 400;
        errorMessage = error.message;
        break;
      default:
        statusCode = 500;
        errorMessage = "Erro interno do servidor";
        break;
    }
    return res.status(statusCode).json({ mensagem: errorMessage });
  }
};

const deletarTransacao = async (req, res) => {
  try {
    const { id } = req.params;
    validarId(id);
    const pegarTransacao = await db.pegarTransacaoPorId(id);
    if (!pegarTransacao) {
      return res.status(400).json({
        mensagem: "Transação não encontrada.",
      });
    }

    if (pegarTransacao.usuario_id !== req.usuario.id) {
      return res.status(401).json({
        mensagem: "Você não tem autorização de alterar essa transação",
      });
    }

    await db.deletarTansacao(id);
    return res.status(204).send();
  } catch (error) {
    if (error.message === "O ID deve ser um número positivo") {
      return res.status(400).json({ mensagem: error.message });
    } else {
      return res.status(500).json({ mensagem: "Erro interno do servidor" });
    }
  }
};

const extratoTransacao = async (req, res) => {
  try {
    let entradas = 0;
    let saidas = 0;
    const { id } = req.usuario;
    const transacoes = await db.pegarTransacoesDoUsuarioPorId(id);

    transacoes.forEach((transacao) => {
      if (transacao.tipo === "entrada") {
        entradas += Number(transacao.valor);
      }
      if (transacao.tipo === "saida") {
        saidas += Number(transacao.valor);
      }
    });

    const arrayResposta = {
      entrada: entradas,
      saida: saidas,
    };

    res.status(200).json(arrayResposta);
  } catch (error) {
    return res.status(500).json({ mensagem: error.message });
  }
};

const filtrarTransacaoPorCategoria = async (req, res) => {
  try {
    const requisicoes = req.query;
    const idUsuario = req.usuario.id;
    const arrayResposta = [];
    const filtrosExistentes = [];
    const categorias = await db.listarCategorias();

    if (typeof requisicoes.filtro === "string") {
      const filtroFormatado = formataString(requisicoes.filtro);
      const incluiFiltro = categorias.some((categoria) =>
        categoria.descricao
          .toLowerCase()
          .includes(filtroFormatado.toLowerCase())
      );

      if (!incluiFiltro) {
        return res
          .status(400)
          .json({ mensagem: "Filtro informado não existe" });
      }

      const transacoes = await db.pegarTransacaoPorTipo(
        filtroFormatado,
        idUsuario
      );

      for (let transacao of transacoes) {
        const categoriaTransacao = await db.pegarCategoriaPorId(
          transacao.categoria_id
        );

        const arrayFormatado = {
          id: transacao.id,
          tipo: transacao.saida,
          descricao: transacao.descricao,
          valor: transacao.valor,
          data: transacao.data,
          usuario_id: transacao.usuario_id,
          categoria_id: transacao.categoria_id,
          categoria_nome: categoriaTransacao.descricao,
        };

        arrayResposta.push(arrayFormatado);
      }
    } else if (Array.isArray(requisicoes.filtro)) {
      for (let filtro of requisicoes.filtro) {
        const filtroFormatado = formataString(filtro);
        const categoriasFiltradas = categorias.filter((categoria) =>
          categoria.descricao.includes(filtroFormatado)
        );
        filtrosExistentes.push(...categoriasFiltradas);
      }

      if (filtrosExistentes.length !== requisicoes.filtro.length) {
        return res
          .status(400)
          .json({ mensagem: "Filtro informado não existe" });
      }

      for (let tipo of requisicoes.filtro) {
        const tipoFormatado = formataString(tipo);
        const transacoes = await db.pegarTransacaoPorTipo(
          tipoFormatado,
          idUsuario
        );

        for (let transacao of transacoes) {
          const categoriaTransacao = await db.pegarCategoriaPorId(
            transacao.categoria_id
          );

          const arrayFormatado = {
            id: transacao.id,
            tipo: transacao.saida,
            descricao: transacao.descricao,
            valor: transacao.valor,
            data: transacao.data,
            usuario_id: transacao.usuario_id,
            categoria_id: transacao.categoria_id,
            categoria_nome: categoriaTransacao.descricao,
          };

          arrayResposta.push(arrayFormatado);
        }
      }
    }

    return res.status(200).json(arrayResposta);
  } catch (error) {
    return res.status(500).json({ mensagem: error.message });
  }
};

module.exports = {
  filtrarTransacaoPorCategoria,
  deletarTransacao,
  modificarTransacao,
  cadastrarTransacao,
  extratoTransacao,
};
