# MTA Market - Sistema con Integración Discord

Este proyecto incluye un sitio web estático y un servidor backend para integrar con Discord.

## Requisitos
- Node.js instalado
- Cuenta en GitHub
- Cuenta en Railway (para el backend)

## Configuración del Bot de Discord
1. Crea un bot en [Discord Developer Portal](https://discord.com/developers/applications).
2. Invita el bot a tu servidor con permisos de administrador.
3. Obtén el TOKEN del bot, GUILD_ID (ID del servidor), CATEGORY_ID (ID de la categoría).

## Subir a GitHub
1. Crea un repositorio en GitHub.
2. Sube todos los archivos (excepto node_modules).
3. Para el frontend (GitHub Pages):
   - Ve a Settings > Pages > Source: Deploy from a branch > Selecciona main.
   - El sitio estará en https://tuusuario.github.io/tu-repo

## Desplegar Backend en Railway
1. Ve a [Railway](https://railway.app) y crea una cuenta.
2. Conecta tu repo de GitHub.
3. Railway detectará el package.json y desplegará.
4. En Variables de Entorno, agrega:
   - BOT_TOKEN: Tu token del bot
   - GUILD_ID: ID del servidor
   - CATEGORY_ID: ID de la categoría
5. El servidor estará en una URL como https://tu-app.railway.app

## Configuración Final
- Edita `script.js`: Reemplaza `SERVER_URL` con la URL de Railway.
- Para desarrollo local: Cambia `SERVER_URL` a 'http://localhost:3000' y ejecuta `npm start`.

## Funcionamiento
- Al solicitar una compra, se crea un canal privado en la categoría especificada.
- El canal incluye un mensaje inicial con los detalles.
- El usuario es redirigido al Discord.

## Notas
- El servidor debe estar corriendo para que funcione la creación de canales.
- Asegúrate de que el bot tenga permisos en la categoría.