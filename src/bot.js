const { Client, GatewayIntentBits, Collection, REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config(); // Carrega variáveis de ambiente do arquivo .env

// Carrega o token do bot a partir das variáveis de ambiente
const token = process.env.DISCORD_TOKEN;
const clientId = process.env.CLIENT_ID;

// Cria uma instância do cliente do Discord com os intents necessários
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,          // Intenção de acessar dados dos servidores (Guilds)
        GatewayIntentBits.GuildPresences,  // Intenção de monitorar as presenças dos membros (atividades como jogos)
        GatewayIntentBits.GuildMembers     // Intenção de acessar informações dos membros (necessária para alteração de apelidos e cargos)
    ]
});

// Coleção para armazenar comandos
client.commands = new Collection();

// Carrega comandos
const commandsPath = path.join(__dirname, 'commands');
if (fs.existsSync(commandsPath)) {
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);

        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
            console.log(`Comando carregado: ${command.data.name}`);
        } else {
            console.warn(`Comando em ${filePath} está faltando "data" ou "execute"`);
        }
    }
}

// Carrega eventos
const eventsPath = path.join(__dirname, 'events');
if (fs.existsSync(eventsPath)) {
    const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

    for (const file of eventFiles) {
        const filePath = path.join(eventsPath, file);
        const event = require(filePath);
        const eventName = path.basename(file, '.js');

        client.on(eventName, event);
        console.log(`Evento carregado: ${eventName}`);
    }
}

/**
 * Evento 'ready' que é disparado quando o bot está logado e pronto.
 */
client.once('ready', async () => {
    console.log(`✅ Logged in as ${client.user.tag}!`);
    console.log(`📋 ${client.commands.size} comando(s) carregado(s)`);
    console.log(`🔧 Para registrar/atualizar comandos, use: npm run deploy`);

    // Exibe status do bot
    console.log(`🌐 Bot ativo em ${client.guilds.cache.size} servidor(es)`);
    client.guilds.cache.forEach(guild => {
        console.log(`  • ${guild.name} (${guild.memberCount} membros)`);
    });
});// Manipula interações de comandos slash
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(`Erro ao executar comando ${interaction.commandName}:`, error);

        const errorMessage = {
            content: '❌ Houve um erro ao executar este comando!',
            ephemeral: true
        };

        if (interaction.replied || interaction.deferred) {
            await interaction.followUp(errorMessage);
        } else {
            await interaction.reply(errorMessage);
        }
    }
});

// Faz login do bot usando o token fornecido
client.login(token);
