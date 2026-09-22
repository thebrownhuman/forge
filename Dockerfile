# Two stages so the NUC never needs Node: the build happens here, and the
# runtime image is nginx plus static files.
FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
# The content gate runs in the image build too, so a broken study day cannot
# be deployed even if someone skips it locally.
RUN npm run validate:content && npm run build

FROM nginx:alpine
COPY --from=build /app/dist/forge/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
  CMD wget -qO- http://localhost/ >/dev/null || exit 1
