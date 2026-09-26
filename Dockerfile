# JavaScript Visualized — static site served by nginx
# Build:  docker build -t js-visualized .
# Run:    docker run -p 5500:80 js-visualized
# Open:   http://localhost:5500

FROM nginx:alpine

# nginx's default site root — everything in the repo is a static file
COPY . /usr/share/nginx/html

EXPOSE 80
