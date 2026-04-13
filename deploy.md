# Manual de despliegue en VPS Ubuntu RackNerd

Este documento describe el despliegue de la app monorepo `food-store-online` en un VPS con Ubuntu en RackNerd usando:

- `GitHub Actions` para despliegue automático
- `Nginx` para servir el frontend y hacer proxy de la API
- `PM2` para mantener corriendo el backend
- `Certbot` para HTTPS

La guía está basada en la configuración actual del repo:

- El workflow vive en `.github/workflows/deploy.yml`
- El build del frontend se genera dentro de `backend/built/public`
- El backend se ejecuta desde `backend/built/server.js`
- El frontend usa variables `NG_APP_*` generadas en build
- El backend usa `dotenv` y lee variables desde `backend/built/.env` en producción

## 1. Arquitectura recomendada

Configuración recomendada para producción:

- `https://solartun.com.mx` -> frontend Angular
- `https://www.solartun.com.mx` -> frontend Angular
- `https://api.solartun.com.mx` -> backend Node/Express

Modelo de despliegue:

- `Nginx` sirve el frontend estático
- `Nginx` hace proxy a `127.0.0.1:5000` para la API
- `PM2` mantiene vivo el backend
- `GitHub Actions` hace pull, instala dependencias, compila y reinicia PM2

## 2. Estructura del monorepo

Puntos clave del proyecto:

- El script raíz `npm run build` primero compila el backend y luego el frontend
- El frontend compila dentro de `backend/built/public`
- Con el builder actual de Angular, el `index.html` de producción queda normalmente en `backend/built/public/browser/index.html`
- El backend expone rutas `/api/...`
- El backend permite CORS solo para `CLIENT_URL`

Implicaciones para producción:

- El dominio principal no debe apuntar por proxy al backend
- El frontend debe servirse desde disco con Nginx
- La API debe vivir en subdominio propio

## 3. Requisitos previos

Antes de empezar, asegúrate de tener:

- Un VPS Ubuntu en RackNerd
- Acceso SSH al VPS
- Un dominio apuntando al VPS
- Un repositorio GitHub accesible desde el VPS
- Una base de datos MongoDB remota o Atlas

## 4. Preparación inicial del VPS

Conéctate al VPS:

```bash
ssh root@TU_IP_DEL_VPS
```

Actualiza el sistema e instala paquetes base:

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y git curl nginx ufw build-essential
```

Instala Node.js 20:

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

Instala PM2 globalmente:

```bash
sudo npm install -g pm2
```

Verifica versiones:

```bash
node -v
npm -v
pm2 -v
git --version
nginx -v
```

Sugerencia:

- Usa `Node 20` para alinearte con el rango soportado por el proyecto

## 5. Firewall UFW sin bloquear SSH

Orden correcto para activar UFW:

```bash
sudo ufw allow OpenSSH
sudo ufw allow 22/tcp
sudo ufw allow 'Nginx Full'
sudo ufw enable
sudo ufw status verbose
```

Sugerencias:

- No actives `ufw` antes de permitir `OpenSSH`
- No abras públicamente el puerto `5000`
- `Nginx` debe hablar con Node usando `127.0.0.1:5000`

Si te bloqueas por firewall:

- Entra por la consola web de RackNerd
- Ejecuta:

```bash
ufw disable
systemctl status ssh
```

- Luego vuelve a permitir SSH y reactiva UFW

## 6. DNS del dominio

Configura estos registros `A` apuntando a la IP del VPS:

- `@` -> IP del VPS
- `www` -> IP del VPS
- `api` -> IP del VPS

Ejemplo:

- `solartun.com.mx`
- `www.solartun.com.mx`
- `api.solartun.com.mx`

## 7. Acceso SSH para GitHub Actions

Genera una clave dedicada desde tu equipo local:

```powershell
ssh-keygen -t ed25519 -C "github-actions-food-store" -f $env:USERPROFILE\.ssh\github_actions_food_store
```

Muestra la clave pública:

```powershell
Get-Content $env:USERPROFILE\.ssh\github_actions_food_store.pub
```

En el VPS, agrégala al usuario que hará el despliegue:

```bash
mkdir -p ~/.ssh
chmod 700 ~/.ssh
nano ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

Pega la clave pública en `authorized_keys`.

Muestra la clave privada para copiarla a GitHub Secrets:

```powershell
Get-Content $env:USERPROFILE\.ssh\github_actions_food_store
```

Sugerencia:

- Para simplificar permisos con `/var/www/food-store-online`, usar `root` como usuario de despliegue puede ser más simple
- Si usas otro usuario, deberás dar permisos de escritura sobre `/var/www/food-store-online`

## 8. Secrets requeridos en GitHub Actions

En `Settings > Secrets and variables > Actions`, crea:

- `VPS_HOST` = IP pública del VPS
- `VPS_USER` = usuario SSH del VPS
- `VPS_PORT` = normalmente `22`
- `SSH_PRIVATE_KEY` = contenido completo de la clave privada
- `MONGODB_REMOTE_URL` = conexión de MongoDB
- `JWT_SECRET` = secreto JWT largo y seguro
- `CLIENT_URL` = `https://solartun.com.mx`
- `NG_APP_API_BASE_URL` = `https://api.solartun.com.mx`
- `NG_APP_PAYPAL_CLIENT_ID` = client id de PayPal

Notas:

- `CLIENT_URL` debe coincidir con el dominio del frontend
- `NG_APP_API_BASE_URL` debe apuntar al subdominio API
- Si tu rama principal es `main`, debes cambiar el workflow porque actualmente dispara en `master`

## 9. Workflow de GitHub Actions

El workflow actual:

- Clona el repo en `/var/www/food-store-online` si todavía no existe
- Actualiza el repo con `git fetch` y `git reset --hard origin/master`
- Genera `frontend/.env`
- Instala dependencias de `backend` y `frontend`
- Ejecuta `npm run build`
- Genera `backend/built/.env`
- Reinicia o crea el proceso `food-store` en PM2

Ubicación correcta del workflow:

- `.github/workflows/deploy.yml`

Puntos importantes:

- No debe vivir en la raíz del repo
- Si despliegas a `master`, está listo tal como está
- Si cambias a `main`, ajusta la rama en el workflow y en los comandos `git`

## 10. Ruta de despliegue en el VPS

Ruta recomendada:

```text
/var/www/food-store-online
```

Ventajas:

- Es más adecuada para Nginx que servir desde `/root/...`
- Evita errores de acceso al intentar servir archivos estáticos

Sugerencia:

- Si el despliegue falla por permisos y no usas `root`, ejecuta:

```bash
sudo mkdir -p /var/www/food-store-online
sudo chown -R TU_USUARIO:TU_USUARIO /var/www/food-store-online
```

## 11. Variables de entorno del frontend

El frontend no depende de editar manualmente `environment.production.ts`.

Durante el despliegue, el workflow genera `frontend/.env` con:

```env
NG_APP_API_BASE_URL=https://api.solartun.com.mx
NG_APP_PAYPAL_CLIENT_ID=TU_PAYPAL_CLIENT_ID
```

Ese archivo es consumido durante el build para generar el environment final.

Sugerencias:

- Si usas dominio principal + subdominio API, no dejes `NG_APP_API_BASE_URL` vacío
- Solo deja esa variable vacía si frontend y backend viven bajo el mismo dominio y misma origin

## 12. Variables de entorno del backend

Después del build, el workflow genera:

```text
/var/www/food-store-online/backend/built/.env
```

Contenido esperado:

```env
MONGODB_REMOTE_URL=...
JWT_SECRET=...
CLIENT_URL=https://solartun.com.mx
NODE_ENV=production
PORT=5000
```

Sugerencias:

- `CLIENT_URL` debe ser exactamente el dominio que servirá el frontend
- Si usas `https://www.solartun.com.mx` como dominio principal, entonces usa ese valor
- Evita inconsistencias entre `CLIENT_URL` y el dominio real porque romperá CORS

## 13. Primer despliegue manual de validación

Antes de depender de GitHub Actions, puede ser útil validar el build manualmente en el VPS:

```bash
cd /var/www
git clone https://github.com/jchablepat/food-store-online.git
cd /var/www/food-store-online

cd backend
npm ci

cd ../frontend
npm ci

cd ..
npm run build
```

Luego revisa el resultado:

```bash
ls -la /var/www/food-store-online/backend/built
ls -la /var/www/food-store-online/backend/built/public
ls -la /var/www/food-store-online/backend/built/public/browser
```

Muy importante:

- Con la configuración actual de Angular, el frontend suele quedar en `backend/built/public/browser`
- Verifica que exista `index.html` ahí

## 14. Configuración completa de Nginx

Crea el archivo:

```bash
sudo nano /etc/nginx/sites-available/food-store
```

Usa esta configuración:

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name solartun.com.mx www.solartun.com.mx;

    root /var/www/food-store-online/backend/built/public/browser;
    index index.html;

    access_log /var/log/nginx/food-store.access.log;
    error_log /var/log/nginx/food-store.error.log;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location = /favicon.ico {
        log_not_found off;
        access_log off;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|webp|woff|woff2|ttf|map)$ {
        expires 7d;
        add_header Cache-Control "public, max-age=604800";
        try_files $uri =404;
    }
}

server {
    listen 80;
    listen [::]:80;
    server_name api.solartun.com.mx;

    access_log /var/log/nginx/food-store-api.access.log;
    error_log /var/log/nginx/food-store-api.error.log;

    client_max_body_size 10m;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 60s;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
    }
}
```

Activa la configuración:

```bash
sudo rm -f /etc/nginx/sites-enabled/default
sudo ln -sf /etc/nginx/sites-available/food-store /etc/nginx/sites-enabled/food-store
sudo nginx -t
sudo systemctl reload nginx
```

## 15. Certificados SSL con Certbot

Instala Certbot:

```bash
sudo apt install -y certbot python3-certbot-nginx
```

Genera certificados:

```bash
sudo certbot --nginx -d solartun.com.mx -d www.solartun.com.mx -d api.solartun.com.mx
```

Verifica renovación:

```bash
sudo systemctl status certbot.timer
```

Sugerencia:

- Primero valida que todo funcione en HTTP antes de ejecutar Certbot

## 16. PM2 y arranque automático

El workflow intenta reiniciar o crear el proceso:

```bash
pm2 describe food-store >/dev/null 2>&1 && pm2 restart food-store --update-env || pm2 start npm --name food-store -- start
pm2 save
```

Después, en el VPS ejecuta una vez:

```bash
pm2 startup
```

PM2 te devolverá un comando. Ejecútalo exactamente y luego:

```bash
pm2 save
```

Verificaciones:

```bash
pm2 status
pm2 logs food-store --lines 100
```

## 17. Primer deploy por GitHub Actions

Una vez configurado todo:

1. Haz commit del workflow
2. Haz push a la rama `master`
3. Entra a la pestaña `Actions` de GitHub
4. Revisa el job `Deploy al VPS`

Si tu rama principal es `main`, cambia antes el workflow.

## 18. Verificaciones después del despliegue

Comprueba que el build exista:

```bash
ls -la /var/www/food-store-online/backend/built/public
ls -la /var/www/food-store-online/backend/built/public/browser
```

Comprueba que exista el `index.html`:

```bash
ls -la /var/www/food-store-online/backend/built/public/browser/index.html
```

Comprueba que el backend responda localmente:

```bash
curl http://127.0.0.1:5000/api/foods
```

Comprueba Nginx:

```bash
sudo nginx -t
sudo systemctl status nginx
```

Comprueba PM2:

```bash
pm2 status
pm2 logs food-store --lines 100
```

## 19. Problemas frecuentes y soluciones

### Error: `500 Internal Server Error` en el dominio principal

Causas comunes:

- Nginx apunta a una ruta incorrecta
- El frontend no se construyó
- El `index.html` no existe en la ruta configurada
- Se sigue usando proxy al backend en el dominio principal

Qué revisar:

```bash
ls -la /var/www/food-store-online/backend/built/public/browser
sudo tail -n 100 /var/log/nginx/food-store.error.log
```

### Error: `directory index ... is forbidden`

Esto suele significar:

- Nginx está apuntando a una carpeta sin `index.html`
- Se usó `root /var/www/food-store-online/backend/built/public;`
- Pero el archivo real está en `.../public/browser/index.html`

Solución:

- Cambia el `root` de Nginx a:

```nginx
root /var/www/food-store-online/backend/built/public/browser;
```

### Error: `403 Forbidden`

Causas comunes:

- Ruta incorrecta
- Permisos insuficientes sobre archivos o carpetas
- Nginx no puede leer la carpeta configurada

Qué revisar:

```bash
namei -l /var/www/food-store-online/backend/built/public/browser/index.html
ls -la /var/www/food-store-online/backend/built/public/browser
```

### Error: no puedes entrar por SSH después de configurar UFW

Causa probable:

- Se activó `ufw` antes de permitir `OpenSSH`

Recuperación:

- Entra por la consola web de RackNerd
- Ejecuta:

```bash
ufw disable
systemctl status ssh
```

- Luego:

```bash
ufw allow OpenSSH
ufw allow 22/tcp
ufw allow 'Nginx Full'
ufw enable
```

### Error: la API no responde en `api.solartun.com.mx`

Qué revisar:

```bash
pm2 status
pm2 logs food-store --lines 100
curl http://127.0.0.1:5000/api/foods
sudo tail -n 100 /var/log/nginx/food-store-api.error.log
```

Causas comunes:

- PM2 no levantó el backend
- Falta `backend/built/.env`
- Falló la conexión a MongoDB
- `CLIENT_URL` es incorrecto

### Error: el deploy falla por permisos en `/var/www/food-store-online`

Solución:

```bash
sudo mkdir -p /var/www/food-store-online
sudo chown -R TU_USUARIO:TU_USUARIO /var/www/food-store-online
```

O bien:

- Usa `root` como usuario de despliegue en GitHub Actions

## 20. Buenas prácticas recomendadas

- Mantén `Nginx` sirviendo el frontend y deja el backend solo para `/api`
- No expongas el puerto `5000` al exterior
- Usa `Node 20`
- No sirvas archivos estáticos desde `/root/...`
- Verifica manualmente el build una vez antes de automatizar todo
- Confirma que `CLIENT_URL` coincida exactamente con el dominio real del frontend
- Revisa si tu rama principal es `master` o `main`
- Antes de pedir SSL, confirma que HTTP ya responde bien

## 21. Checklist final

- VPS Ubuntu listo
- Node.js instalado
- Nginx instalado
- PM2 instalado
- UFW configurado sin bloquear SSH
- Dominio y subdominio apuntando al VPS
- Secrets de GitHub configurados
- Workflow en `.github/workflows/deploy.yml`
- Build generado correctamente
- `index.html` disponible en `backend/built/public/browser`
- Nginx con root correcto
- PM2 levantando el backend
- Certbot configurado

## 22. Comandos útiles de diagnóstico

```bash
pm2 status
pm2 logs food-store --lines 100
sudo nginx -t
sudo systemctl status nginx
sudo tail -n 100 /var/log/nginx/error.log
sudo tail -n 100 /var/log/nginx/food-store.error.log
sudo tail -n 100 /var/log/nginx/food-store-api.error.log
curl http://127.0.0.1:5000/api/foods
ls -la /var/www/food-store-online/backend/built/public
ls -la /var/www/food-store-online/backend/built/public/browser
```

## 23. Resumen operativo

Flujo final recomendado:

1. Preparar VPS
2. Configurar UFW sin bloquear SSH
3. Configurar DNS
4. Configurar acceso SSH para GitHub Actions
5. Cargar secrets en GitHub
6. Validar build manual una vez
7. Configurar Nginx para frontend principal y API en subdominio
8. Configurar PM2
9. Hacer primer deploy por GitHub Actions
10. Activar HTTPS con Certbot

Si en algún punto aparece un error, revisa primero:

- Logs de Nginx
- Logs de PM2
- Existencia del build
- Permisos de la ruta configurada
- Correspondencia entre dominio, secrets y variables de entorno
