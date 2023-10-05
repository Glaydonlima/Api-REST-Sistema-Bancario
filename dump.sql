create database dindin;

create table usuarios(
  id serial primary key,
  nome varchar(255) not null,
  email varchar(255) not null unique,
  senha varchar(255) not null
)

create table categorias(
  id serial primary key,
  descricao text not null
)

create table transacoes(
  id serial primary key,
  descricao text not null,
  valor varchar(255) not null,
  data timestamp default now(),
  categoria_id integer references categorias(id),
  usuario_id integer references usuarios(id),
  tipo varchar(255) not null
)

insert into categorias(descricao)
 values 
('Alimentação'),
('Assinaturas e Serviços'),
('Casa'),
('Mercado'),
('Cuidados Pessoais'),
('Educação'),
('Família'),
('Lazer'),
('Pets'),
('Presentes'),
('Roupas'),
('Saúde'),
('Transporte'),
('Salário'),
('Vendas'),
('Outras receitas'),
('Outras despesas');
