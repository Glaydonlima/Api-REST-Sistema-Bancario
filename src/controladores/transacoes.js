const db = require("../data/db");

const cadastrarTransacao = async (req, res) => {
  try {
    const { descricao, valor, data, categoria_id, tipo } = req.body;

    if (!descricao || !valor || !data || !categoria_id || !tipo) {
      return res.status(400).json({
        mensagem: "Todos os campos devem ser preenchidos",
      });
    }
    if (tipo !== "entrada" && tipo !== "saida") {
      return res.status(400).json({
        mensagem: "Campo tipo deve ser informado corretamente",
      });
    }

    if (isNaN(valor) || valor < 0) {
      return res.status(400).json({
        mensagem: "Campo valor deve ser informado corretamente",
      });
    }

    const categorias = await db.listarCategorias();
    const existeCategoria = categorias.find(
      (categoria) => categoria.id == categoria_id
    );
    if (!existeCategoria) {
      return res.status(400).json({
        mensagem: "A categoria informada não existe",
      });
    }
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
    return res.status(500).json({ mensagem: "Erro interno do servidor" });
  }
};

const modificarTransacao = async (req, res) => {
  try {
    const { id } = req.params;
    const { descricao, valor, data, categoria_id, tipo } = req.body;

    if (!descricao || !valor || !data || !categoria_id || !tipo) {
      return res.status(400).json({
        mensagem: "Todos os campos devem ser preenchidos",
      });
    }
    const pegarTransacao = await db.pegarTransacaoPorId(id);

    if (!pegarTransacao) {
      return res.status(400).json({
        mensagem: "Transação não encontrada.",
      });
    }

    if (pegarTransacao.usuario_id !== req.usuario.id) {
      return res.status(400).json({
        mensagem: "Você não tem autorização de alterar essa transação",
      });
    }

    if (tipo !== "entrada" && tipo !== "saida") {
      return res.status(400).json({
        mensagem: "Campo tipo deve ser informado corretamente",
      });
    }

    if (isNaN(valor) || valor < 0) {
      return res.status(400).json({
        mensagem: "Campo valor deve ser informado corretamente",
      });
    }

    const categorias = await db.listarCategorias();
    const existeCategoria = categorias.find(
      (categoria) => categoria.id == categoria_id
    );
    if (!existeCategoria) {
      return res.status(400).json({
        mensagem: "A categoria informada não existe",
      });
    }

    await db.modificarTransacao(id, descricao, valor, data, categoria_id, tipo);

    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ mensagem: "Erro interno do servidor" });
  }
};

const deletarTransacao = async (req, res) => {
  try {
    const { id } = req.params;
    const pegarTransacao = await db.pegarTransacaoPorId(id);
    console.log(pegarTransacao);
    if (!pegarTransacao) {
      return res.status(400).json({
        mensagem: "Transação não encontrada.",
      });
    }

    if (pegarTransacao.usuario_id !== req.usuario.id) {
      return res.status(400).json({
        mensagem: "Você não tem autorização de alterar essa transação",
      });
    }

    await db.deletarTansacao(id);
    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ mensagem: "Erro interno do servidor" });
  }
};

const extratoTransacao = async (req, res) => {
  try {
    let entradas = 0;
    let saidas = 0;
    const { id } = req.usuario;
    const transacoes = await db.pegarTransacoesDoUsuarioPorId(id);
    console.log(transacoes);
    for (let transacao of transacoes) {
      if (transacao.tipo === "entrada") {
        entradas += Number(transacao.valor);
      }
      if (transacao.tipo === "saida") {
        saidas += Number(transacao.valor);
      }
    }
    const arrayResposta = {
      entrada: entradas,
      saida: saidas,
    };

    res.status(200).json(arrayResposta);
  } catch (error) {
    return res.status(500).json({ mensagem: "Erro interno do servidor" });
  }
};

const filtrarTransacaoPorCategoria = async (req, res) => {
  try {
    const requisicoes = req.query;
    console.log(typeof requisicoes.filtro);
    const idUsuario = req.usuario.id;
    const arrayResposta = [];
    const filtrosExistentes = [];
    const categorias = await db.listarCategorias();
    console.log(categorias);

    if (typeof requisicoes.filtro === "string") {
      const incluiFiltro = categorias.some((categoria) =>
        categoria.descricao
          .toLowerCase()
          .includes(requisicoes.filtro.toLowerCase())
      );
      console.log(incluiFiltro);
      if (!incluiFiltro) {
        return res
          .status(400)
          .json({ mensagem: "Filtro informado não existe" });
      }

      const transacoes = await db.pegarTransacaoPorTipo(
        requisicoes.filtro.charAt(0).toUpperCase() +
          requisicoes.filtro.slice(1).toLowerCase(),
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
        return res.status(200).json(arrayFormatado);
      }
    }

    for (let filtro of requisicoes.filtro) {
      const categoriasFiltradas = categorias.filter((categoria) =>
        categoria.descricao.includes(
          filtro.charAt(0).toUpperCase() + filtro.slice(1).toLowerCase()
        )
      );
      filtrosExistentes.push(...categoriasFiltradas);
    }

    if (filtrosExistentes.length !== requisicoes.filtro.length) {
      return res.status(400).json({ mensagem: "Filtro informado não existe" });
    }
    for (let tipo of requisicoes.filtro) {
      const transacoes = await db.pegarTransacaoPorTipo(
        tipo.charAt(0).toUpperCase() + tipo.slice(1).toLowerCase(),
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

      return res.status(200).json(arrayResposta);
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ mensagem: "Erro interno do servidor" });
  }
};

module.exports = {
  filtrarTransacaoPorCategoria,
  deletarTransacao,
  modificarTransacao,
  cadastrarTransacao,
  extratoTransacao,
};
