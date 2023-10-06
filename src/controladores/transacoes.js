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

    const categoriaTranscao = await db.pegarCategoriaPorId(categoria_id);

    const arrayResposta = {
      id: transacao.id,
      tipo: transacao.tipo,
      descricao: transacao.descricao,
      valor: transacao.valor,
      data: transacao.data,
      usuario_id: transacao.usuario_id,
      categoria_id: transacao.categoria_id,
      categoria_nome: categoriaTranscao.descricao,
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

    const categoriaTranscao = await db.pegarCategoriaPorId(categoria_id);

    const arrayResposta = {
      id: transacao.id,
      tipo: transacao.tipo,
      descricao: transacao.descricao,
      valor: transacao.valor,
      data: transacao.data,
      usuario_id: transacao.usuario_id,
      categoria_id: transacao.categoria_id,
      categoria_nome: categoriaTranscao.descricao,
    };
    return res.status(201).json(arrayResposta);
  } catch (error) {
    return res.status(500).json({ mensagem: "Erro interno do servidor" });
  }
};

module.exports = { modificarTransacao, cadastrarTransacao };
