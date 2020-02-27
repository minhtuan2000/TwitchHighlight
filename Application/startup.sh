#! /bin/bash

sleep 2m
rm /home/minhtuan270820000/server.conf
eval "cat > /home/minhtuan270820000/server.conf <<EOF
server {
    listen 80;
    server_name $(dig +short myip.opendns.com @resolver1.opendns.com);
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
     }
}
EOF"

sleep 5
sudo /etc/init.d/nginx reload -c "/home/minhtuan270820000/server.conf"

pm2 resurrect
