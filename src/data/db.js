const { Pool } = require("pg");

const { db } = require("../conexao");

// client -> script/app
const pool = new Pool(db);

module.exports = {
  async cadastrarUsuario({ nome, email, senha }) {
    const sql =
      "insert into usuarios(nome, email, senha) values ($1, $2, $3) returning id, nome, email";
    const valores = [nome, email, senha];
    const resposta = await pool.query(sql, valores);
    return resposta.rows[0];
  },

  async existeEmailUsuario(email) {
    const sql = "select count(*) from usuarios where email = $1;";
    const values = [email];
    const { rows } = await pool.query(sql, values);
    return rows[0].count != 0;
  },

  async listarUsuarios() {
    const sql = "select id, nome, email from usuarios";
    const { rows } = await pool.query(sql);
    return rows;
  },

  async pegarUsuarioPorId(id) {
    const sql = `select
          id,
          nome,
          email
      from usuarios
      where id = $1`;
  const { rows, rowCount } = await pool.query(sql, [id]);
  return { rows: rows[0], rowCount };
  },

  async pegarSenhaUsuarioPorEmail(email, senha) {
    const sql = `select id, nome , senha from usuarios where email=$1`;
    const { rows } = await pool.query(sql, [email]);
    return rows[0];
  },

  async listarCategorias() {
    const sql = "select * from categorias";
    const { rows } = await pool.query(sql);
    return rows; 
  
  }
  
};
