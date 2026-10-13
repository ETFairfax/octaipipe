# --- Build stage ---
FROM node:22-alpine AS build
WORKDIR /app

# Matches the pnpm version pinned in package.json's "packageManager" field.
RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps ./apps
COPY packages ./packages

# Installs the whole workspace rather than just platform: pnpm needs every workspace member's
# manifest present to resolve the "workspace:*" deps platform depends on. Not split into a
# manifests-only layer before this because that would mean hand-listing every package's
# package.json path here, which silently rots the day someone adds a new package.
RUN pnpm install --frozen-lockfile

# `...` builds platform's workspace dependencies too (currently no-ops — none of them define a
# "build" script yet — but this stays correct if one adds one later).
RUN pnpm turbo run build --filter=@workspace/platform...

# --- Serve stage ---
FROM nginx:alpine AS serve

# vite.config.ts sets `base` from apps/platform/deploy.yaml's slug (currently "platform"), so the built
# index.html and asset URLs are all rooted at /platform/ — the app must be served from that same
# path prefix or its own asset requests 404. See nginx.conf.
COPY --from=build /app/apps/platform/dist /usr/share/nginx/html/platform
COPY apps/platform/nginx.conf /etc/nginx/conf.d/default.conf

# runtime-config: matches the base path above, and is required by docker/10-runtime-config.sh
# to know where to write config.json. jq does the JSON escaping in that script; nginx:alpine
# doesn't ship it.
ENV APP=platform
RUN apk add --no-cache jq

# Runtime Config
COPY apps/platform/docker/10-runtime-config.sh /docker-entrypoint.d/
RUN chmod +x /docker-entrypoint.d/10-runtime-config.sh

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
