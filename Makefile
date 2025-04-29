.PHONY: build
build:
	node ./build/build.mjs --build

.PHONY: watch
watch:
	node ./build/build.mjs

.PHONY: dev
dev:
	go build -o .tmp/gav-ink ./cmd/gav-ink/main.go \
	&& air

.PHONY: playwright
playwright:
	npx playwright test tests --pass-with-no-tests

.PHONY: playwright-codegen
playwright-codegen:
	npx playwright codegen

.PHONY: vitest
vitest:
	npx vitest run src --pass-with-no-tests

.PHONY: gotest
gotest:
	go test -race -v -timeout 30s ./...

.PHONY: test
test:
	make vitest \
	&& make gotest \
	&& npx playwright test tests --pass-with-no-tests --reporter=dot

.PHONY: docker
docker:
	docker buildx bake -f docker-compose.build.yml --push

.PHONY: prod
prod:
	COMPOSE_BAKE=true docker compose --file docker-compose.yml up -d --build

.PHONY: update
update:
	go get -u ./... \
	&& npm update

.PHONY: android
android:
	emulator @Pixel_9_API_35 -no-metrics

.PHONY: biomecheck
biomecheck:
	biome check --write ./assets/css ./src

.PHONY: rotate
rotate:
	go run tools/rotating-access-key.go

.PHONY: converter
converter:
	node ./build/customConverter.js
