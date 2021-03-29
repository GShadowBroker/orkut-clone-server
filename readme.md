# Orkut Nostalgia / orkut-clone-server

## Sobre / Sinopse

Este é o backend do meu projeto pessoal de clone do orkut. O servidor atua como uma API de comunicação em graphql feita com as seguintes tecnologias:

- Apollo Server
- PostgreSQL Database
- Sequelize ORM
- Cloudinary Image Hosting
- JWT authentication

A aplicação completa pode ser visitada em: https://orkutnostalgia.netlify.app/

## Sumário

> - [Título / Nome do repositório](#título--nome-do-repositório)
> - [Sobre / Sinopse](#sobre--sinopse)
> - [Sumário](#sumario)
> - [Instalação](#instalação)

## Instalação

1.  Clone o projeto: `git clone https://github.com/GShadowBroker/orkut-clone-server.git`
2.  Entre na pasta do projeto e instale dependências: `cd orkut-clone-server && npm install`
3.  Crie um arquivo .env com as credenciais e preencha de acordo.:

```
	APOLLO_KEY=""
	C_API_KEY=""
	C_API_SECRET=""
	C_CLOUD_NAME=""
	TOKEN_SECRET=""
	DB_NAME=""
	DB_USERNAME=""
	DB_PASSWORD=""
	DB_DIALECT=""
```

- Como a hospedagem de imagens é feito no Cloudinary, é preciso fazer uma conta e anotar API_KEY, API_SECRET e CLOUD_NAME.
- O banco de dados usado foi o PostgreSQL. Outros dialetos não foram testados.
- TOKEN_SECRET se refere ao segredo para assinatura dos Json Web Tokens. Para mais informações, (leia a documentação)[https://www.npmjs.com/package/jsonwebtoken].

4. Inicie o servidor de desenvolvimento:
   `npm run dev`

![Servidor de desenvolvimento iniciado](https://i.imgur.com/0rSgIno.png)

![Interface de graphql](https://i.imgur.com/0Tbe613.png)

## License

[Apache License, Version 2.0](http://www.apache.org/licenses/LICENSE-2.0.html)

2020 - Todos os direitos reservados
