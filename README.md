<h1 align="center">
<br>
  <img src="logo.svg" alt="GymPoint" width="200px">
<br>
<br>
Gympoint - backend
</h1>

<p align="center">An API for gym management.</p>

<p align="center">
  <a href="https://opensource.org/licenses/MIT">
    <img src="https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square" alt="License MIT">
  </a>
</p>

<hr />

## Features

A Node.js API built with Express and all the latest tools and best practices in development!

- ⚡ **Express** — A web framework for Node
- 💾 **Sequelize** — SQL dialect ORM for Node.js
- 🔑 **Redis** — key-value data model
- ⌨️ **Yup** - Object schema validation
- 🔺 **Sentry** - cross-platform application monitoring
- 📧 **Nodemailer** - Send e-mails with Node.JS
- 💖 **Lint** — ESlint/Prettier/Editor Config

## Dependencies

- [Node.js](https://nodejs.org/en/) 8.0.0 ou >
- [Yarn](https://yarnpkg.com/pt-BR/docs/install)
- [Docker](https://www.docker.com/)

## Prerequisites

To run this server you will need two containers running on your machine.

To do so, you will need to run the following commands:

- `docker run --name redisgympoint -p 6379:6379 -d -t redis:alpine`;
- `docker run --name database -e POSTGRES_PASSWORD=docker -p 5433:5432 -d postgres`;

_Remember: If you restart your machine, you will need to start again the server with `docker start <container_id>`._

## Getting started

_Consider checking out the FrontEnd [repository](https://github.com/gustavonobrega/frontend-gympoint)!_

1. Clone this repo using `https://github.com/gustavonobrega/backend-gympoint.git`
2. Move to the appropriate directory: `cd backend-gympoint`.<br />
3. Run `yarn` to install dependencies and yarn sequelize db:migrate, yarn sequelize db:seed:all to execute sequelize migrations and seeds.<br />
4. Copy the `.env.example` file and rename it to `.env`.<br/>
5. Add all the values for the environment variables.<br/>
6. Run `yarn start` and `yarn queue` to run the servers at `http://localhost:3333`.
