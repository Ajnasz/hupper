Make this folder a root of your webserver:
npm install -g serve
serve ./

Or with docker: https://github.com/Ajnasz/docker-nginx

Make sure, hup.lh points to localhost

dnsmasq:

create a file: /etc/dnsmasq.d/hup.lh.conf with the following content:
address=/hup.lh/127.0.0.1

hosts:
127.0.0.1 hup.lh
