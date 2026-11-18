FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
RUN if [ ! -f dist/GLOW-MOD/browser/index.html ]; then cp dist/GLOW-MOD/browser/index.csr.html dist/GLOW-MOD/browser/index.html; fi

FROM nginx:alpine
COPY --from=build /app/dist/GLOW-MOD/browser /usr/share/nginx/html
COPY nginx.conf.template /etc/nginx/templates/default.conf.template
EXPOSE 8080
