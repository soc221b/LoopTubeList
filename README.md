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

That's it!
