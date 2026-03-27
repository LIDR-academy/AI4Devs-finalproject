<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Logo de Nest" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">Un framework progresivo de <a href="http://nodejs.org" target="_blank">Node.js</a> para construir aplicaciones del lado del servidor eficientes y escalables.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="Versión de NPM" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Licencia del Paquete" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="Descargas de NPM" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Patrocinadores en Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors en Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donar-PayPal-ff3f59.svg" alt="Donaciones"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Apóyanos-Open%20Collective-41B883.svg" alt="Apóyanos"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Seguir" alt="Síguenos en Twitter"></a>
</p>

## Descripción

Repositorio inicial de TypeScript para el framework [Nest](https://github.com/nestjs/nest).

## Configuración del proyecto

```bash
$ npm install
```

## Compilar y ejecutar el proyecto

```bash
# desarrollo
$ npm run start

# modo watch
$ npm run start:dev

# modo producción
$ npm run start:prod
```

## Iniciar infraestructura con Docker

La aplicación utiliza **PostgreSQL 16** y **Redis 7** para la persistencia y el motor de agregación. Puedes iniciar estos servicios fácilmente utilizando Docker Compose.

**Comandos rápidos:**

```bash
# Levantar los servicios (en segundo plano)
$ docker-compose up -d

# Detener los servicios
$ docker-compose down

# Ver estado de los contenedores
$ docker-compose ps
```

**Configuración de servicios:**
- **PostgreSQL**: Disponible en `localhost:5433`.
- **Redis**: Disponible en `localhost:6379`.

> [!TIP]
> Asegúrate de que los puertos no estén siendo utilizados por otras instancias locales antes de iniciar los contenedores.

## Base de datos (Prisma)

Una vez que los servicios de Docker estén en ejecución, debes sincronizar el esquema de la base de datos y cargar los datos iniciales (Seed).

```bash
# Sincronizar esquema y ejecutar migraciones
$ npx prisma migrate dev

# Cargar datos iniciales (Seed)
$ npx prisma db seed
```

## Pruebas y Despliegue

Para instrucciones detalladas sobre cómo ejecutar pruebas y realizar el despliegue a producción, consulta el archivo:
👉 **[despliegue.md](despliegue.md)**


## Licencia

Nest tiene [licencia MIT](https://github.com/nestjs/nest/blob/master/LICENSE).
