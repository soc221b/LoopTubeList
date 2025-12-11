# Setup

1. Create a Dockerfile:

```sh
cat << EOF > Dockerfile
FROM node:lts

WORKDIR /repo

RUN npm install -g @github/copilot

ENTRYPOINT [ "/bin/sh" ]
EOF
```

2. Build the Docker image:

```sh
docker build -t copilot .
```

3. Run the Docker container with your current directory mounted:

```sh
docker run -it -v .:/repo copilot
```

4. Inside the container, you can now run Copilot commands, for example:

```sh
copilot --allow-all-tools --allow-all-paths --disable-builtin-mcps
```

Local Pages deploy

1. Build the site:

```sh
npm install
npm run build
```

2. Deploy locally (preferred: GitHub CLI):

```shnpx gh pages deploy ./dist --branch gh-pages --message "local deploy"
# or
npm run deploy:local
```

3. Alternatively, use fallback (gh-pages):

```sh
npm run deploy:gh-pages
```

Documentation

- Quickstart: specs/002-github-page/quickstart.md
- Custom domain: docs/custom-domain.md

That's it!
