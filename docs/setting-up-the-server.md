# Getting Started
For the path of least resistance, use the `Deploy to Render.com` button in the README.md. If you would like to host this somewhere else or self host, continue reading.

## Server Architecture

The server is an express.js server written in TypeScript. By default, it uses SQLite as the database with Prisma providing the ORM layer. It should be fairly straightforward to refactor the `schema.prisma` file to work with your database of choice. I went with SQLite for ease of use. 

## Hosting The Server

- The server host will need nodejs version 16 LTS or greater. 
- The server will also need a persistent disk for the SQLite database, or some other database solution. 
- The prisma client and database will need to be initialized during/after the initial build before the server starts.