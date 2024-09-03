const { Client, GatewayIntentBits, Collection } = require('discord.js');
require('dotenv').config(); // Carrega variáveis de ambiente do arquivo .env

// Carrega o token do bot a partir das variáveis de ambiente
const token = process.env.DISCORD_TOKEN;

// Cria uma instância do cliente do Discord com os intents necessários
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,          // Intenção de acessar dados dos servidores (Guilds)
        GatewayIntentBits.GuildPresences,  // Intenção de monitorar as presenças dos membros (atividades como jogos)
        GatewayIntentBits.GuildMembers     // Intenção de acessar informações dos membros (necessária para alteração de apelidos e cargos)
    ]
});

// Carrega o manipulador do evento de atualização de presença
const handlePresenceUpdate = require('./events/presenceUpdate');

/**
 * Evento 'ready' que é disparado quando o bot está logado e pronto.
 * Aqui ele exibe no console a mensagem de que o bot foi logado com sucesso.
 */
client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

// Registra o manipulador do evento de atualização de presença 'presenceUpdate'
// Este evento é acionado quando o status de presença (atividades, jogo etc.) de um membro muda
client.on('presenceUpdate', handlePresenceUpdate);

// Faz login do bot usando o token fornecido
client.login(token);
