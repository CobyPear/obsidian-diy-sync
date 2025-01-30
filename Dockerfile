FROM node:22-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
COPY . /app
WORKDIR /app

FROM base AS install
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install

FROM install AS test
RUN pnpm -F './configs/vitest-environment-obsync' build
CMD ["pnpm", "test:server"]

FROM install AS dev
CMD ["pnpm", "dev:server"]


FROM base AS build
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm -F obsidian-sync-server build:prod

FROM build AS pruned
RUN pnpm -F obsidian-sync-server --prod deploy pruned

# entrypoint container with dumb-init
FROM node:22-alpine
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /app
RUN apk update && apk add --no-cache dumb-init
RUN pnpm install -g pm2
ENV NODE_ENV=production
ENV PORT=8000
ENV DATABASE_URL=$DATABASE_URL
COPY --from=pruned --chown=node:node /app/pruned /app
EXPOSE 8000

ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD [ "pm2-runtime", "--", "./build/server.js" ]
