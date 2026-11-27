FROM node:lts-alpine AS build
WORKDIR /app
RUN npm install -g corepack@0.36.0 && corepack enable
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN ["pnpm", "run", "build"]

FROM caddy:2.11-alpine
COPY --from=build /app/dist /usr/share/caddy
EXPOSE 80
