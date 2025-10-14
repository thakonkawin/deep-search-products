# ---------- Builder Stage ----------
FROM oven/bun:latest AS build

WORKDIR /app

COPY package*.json bun.lock ./

ARG VITE_BASE_URL
ENV VITE_BASE_URL=${VITE_BASE_URL}

RUN bun install

COPY . .

# RUN bun run build
RUN bun run vite build

# ---------- Production Stage ----------
FROM nginx:1.29.0-alpine3.22

COPY ./nginx.conf /etc/nginx/nginx.conf
COPY --from=build /app/dist /usr/share/nginx/html/

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
