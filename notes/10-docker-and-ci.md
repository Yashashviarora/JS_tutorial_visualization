# 10 · Tooling — Docker, docker-compose, GitHub Actions CI

(How this repo itself is served and tested.)

## Why containers are lightweight (the inner architecture)

A **VM** fakes an entire computer and boots a full OS per app — gigabytes, minutes.
A **container** brings only an app + its files and **borrows the HOST's kernel** — megabytes, milliseconds. It's just a normal process that the Linux kernel isolates:

- **Namespaces** = what the process can SEE (its own process list, network, filesystem root).
- **cgroups** = what it can USE (CPU/RAM caps).

> A container = an ordinary process wearing namespace-blinders on a cgroup-leash, sharing the host kernel.

(Windows has no Linux kernel → Docker Desktop needs **WSL** to provide one shared kernel for all containers.)

**Images are LAYERS** (one per Dockerfile instruction), deduplicated and cached: ten images based on `nginx:alpine` store Alpine once. Containers add only a thin writable scratch layer (copy-on-write) — starting 100 containers copies nothing. Software "comes from" **registries** (Docker Hub): `docker run redis` pulls the sealed, pre-built redis image.

## Image vs container

| | Image | Container |
|---|---|---|
| What | files, frozen (read-only layers) | a running **process** |
| Analogy | class / recipe / `createCounter` | instance / dish / `counterA` |
| Made by | `docker build` / `pull` | `docker run <image>` |

One image → many independent containers (exactly one factory → many closures 🎒).

## Dockerfile vs docker-compose.yml

```text
BUILD TIME                            RUN TIME
Dockerfile ─docker build→ IMAGE ─docker run→ CONTAINER
"what's INSIDE the box?"              "which boxes run, wired HOW?"
```

This repo's [`Dockerfile`](../Dockerfile):

```dockerfile
FROM nginx:alpine            # inherit a ready-made web server image (~5 MB linux)
COPY . /usr/share/nginx/html # bake OUR files into the folder nginx serves by default
EXPOSE 80                    # documentation: the box listens on 80
```

Why COPY? The container can't see your disk (namespaces!) — without COPY, nginx serves its default page. COPY makes the image **self-contained**: ship it anywhere, content included. (Dev alternative: a bind-mount volume = a live window into your folder, no rebuild per edit — but then the image alone is empty.)

[`docker-compose.yml`](../docker-compose.yml) = the run configuration, committed to git:

```yaml
services:
  site:
    build: .          # get the image from ./Dockerfile
    ports:
      - "5500:80"     # my port 5500 → container's 80 (runtime wiring, no rebuild to change)
```

`docker compose up` → http://localhost:5500. Compose shines with MULTIple services (web + postgres + redis): private network where services reach each other by name, volumes for surviving data, `depends_on` ordering — one YAML instead of a page of `docker run` commands.

**Division of labor:** Dockerfile for what YOU make; compose for what you ASSEMBLE (off-the-shelf images need no Dockerfile).

## The CI ([.github/workflows/ci.yml](../.github/workflows/ci.yml))

**CI** = on every push, GitHub runs your checks on their servers, free. Answers: *"if someone clones this right now, does it work?"* Anything in `.github/workflows/` is auto-discovered; `on: push / pull_request` is the trigger (addEventListener for your repo 😄). Two parallel jobs:

1. **JS syntax check** — `node --check` on every `.js` file: a typo'd bracket = red ❌ within a minute.
2. **Docker build + smoke test** — builds the image, runs a container, `curl`s every page expecting HTTP 200. Rename a file and forget the hub? CI catches it before a visitor does.

## Running this repo

```bash
npx http-server -p 5500 -c-1    # option A: Node
docker compose up               # option B: Docker → http://localhost:5500
# option C (zero install for visitors): GitHub Pages link
```

Why a server at all? `file://` pages are blocked from loading sibling `.js` files ('file:' URLs are treated as unique security origins); `http://127.0.0.1` gives all files one origin. VS Code's **Live Server** extension does the same with auto-reload (the 127.0.0.1:5500 in every Namaste JS video).

## Say it in one breath

> "An image is a frozen, layered filesystem built from a Dockerfile; a container is a running process from that image, isolated by kernel namespaces/cgroups and sharing the host kernel — which is why it's megabytes and milliseconds, not gigabytes and minutes. Compose is the committed run-config (ports, volumes, multi-service wiring), and CI rebuilds and smoke-tests the whole thing on GitHub's servers at every push."
