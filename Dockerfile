ARG VERSION="0.0.1"
ARG DATE="2025-04-25"
ARG NODE_VERSION=22-alpine
ARG GO_VERSION=1.24-alpine

FROM --platform=$BUILDPLATFORM node:$NODE_VERSION AS node
ARG TARGETARCH
WORKDIR /app

COPY --link package.json ./
COPY --link ./assets ./assets
COPY --link ./build ./build
COPY --link ./Makefile ./
COPY --link ./src ./src
COPY --link ./tsconfig.json ./
COPY --link ./internal ./internal
COPY --link ./tokens.json ./

RUN : \
&& apk add --no-cache make \
&& npm install --verbose --omit=dev \
&& :


FROM node AS prebuild
WORKDIR /app

RUN make build


FROM --platform=$BUILDPLATFORM golang:$GO_VERSION AS go
ARG TARGETARCH
WORKDIR /app
COPY go.mod go.sum ./

RUN : \
&& go mod download \
&& apk add --no-cache zig ca-certificates \
&& :


FROM --platform=$BUILDPLATFORM ghcr.io/a-h/templ:latest AS templ
ARG TARGETARCH
COPY --chown=65532:65532 . /app
COPY --from=go /app /app
COPY --from=prebuild --chown=65532:65532 /app /app
WORKDIR /app

RUN ["templ", "generate"]


FROM go AS build
ARG TARGETARCH
WORKDIR /app

COPY --from=templ /app /app

RUN : \
&& if [ "$TARGETARCH" = "arm64" ]; \
    then \
        CGO_ENABLED=1 \
        GOOS=linux \
        GOARCH=${TARGETARCH} \
        CC="zig cc -target aarch64-linux-musl" \
        go build -o /gav-ink ./cmd/gav-ink/main.go; \
    elif [ "$TARGETARCH" = "amd64" ]; \
        then \
            CGO_ENABLED=1 \
            GOOS=linux \
            GOARCH=${TARGETARCH} \
            CC="zig cc -target x86_64-linux-musl" \
            CXX="zig c++ -target x86_64-linux-musl"\
            go build -o /gav-ink ./cmd/gav-ink/main.go; \
    else \
        echo Invalid Target Architecture: $TARGETARCH; \
fi \
&& chmod +x /gav-ink \
# && adduser --disabled-password -u 10001 nonroot \
&& :


#FROM gcr.io/distroless/base-debian12 AS deploy
FROM alpine AS deploy
#FROM scratch AS deploy
ARG VERSION
ARG DATE
WORKDIR /

COPY --from=build /gav-ink ./gav-ink
COPY --from=build /app/dist ./dist
COPY --from=build /app/assets/studies ./assets/studies
COPY --from=build /app/package.json ./package.json

#COPY --link --from=build /etc/passwd /etc/passwd
#COPY --chown=nonroot --from=build /app/bin/gav-ink .
#COPY --chown=nonroot --from=build /app/assets ./assets
#COPY --chown=nonroot --from=build /app/public/css ./public/css
#COPY --chown=nonroot --from=build /app/public/favicon.ico ./public/favicon.ico
#COPY --chown=nonroot --from=build /app/bin/images ./public/images

# USER nonroot
ENV env=prod \
   HOST=0.0.0.0 \
   PORT=8080

EXPOSE 8080

ENTRYPOINT ["./gav-ink"]

LABEL vendor=gavink \
      ink.gav.is-beta=True\
      ink.gav.is-production=True \
      ink.gav.version=$VERSION \
      ink.gav.release-date=$DATE
