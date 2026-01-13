const express = require('express');
const { Client, GatewayIntentBits } = require('discord.js');

const app = express();
app.use(express.json());

// Configuración del bot de Discord
const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

const BOT_TOKEN = process.env.BOT_TOKEN || 'TU_BOT_TOKEN_AQUI'; // Usar variable de entorno
const GUILD_ID = process.env.GUILD_ID || 'TU_GUILD_ID_AQUI';
const CATEGORY_ID = process.env.CATEGORY_ID || 'TU_CATEGORY_ID_AQUI';

client.login(BOT_TOKEN);

client.once('ready', () => {
    console.log('Bot de Discord conectado');
});

// Endpoint para crear canal
app.post('/crear-canal', async (req, res) => {
    const { usuario, producto } = req.body;

    try {
        const guild = client.guilds.cache.get(GUILD_ID);
        if (!guild) return res.status(500).json({ error: 'Servidor no encontrado' });

        const category = guild.channels.cache.get(CATEGORY_ID);
        if (!category) return res.status(500).json({ error: 'Categoría no encontrada' });

        // Crear canal de texto
        const channelName = `solicitud-${usuario}-${Date.now()}`;
        const channel = await guild.channels.create({
            name: channelName,
            type: 0, // TEXT
            parent: CATEGORY_ID,
            permissionOverwrites: [
                {
                    id: guild.roles.everyone.id,
                    deny: ['ViewChannel']
                }
            ]
        });

        // Enviar mensaje inicial
        await channel.send(`Nueva solicitud de compra:\nUsuario: ${usuario}\nProducto: ${producto}\nPor favor, confirma la compra aquí.`);

        res.json({ success: true, channelId: channel.id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al crear canal' });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});