const { REST, Routes } = require('discord.js');
require('dotenv').config();

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.CLIENT_ID;

if (!token || !clientId) {
    console.error('[Deploy] ❌ DISCORD_TOKEN ou CLIENT_ID não encontrados no .env');
    process.exit(1);
}

const rest = new REST({ version: '10' }).setToken(token);

async function deployCommands() {
    try {
        console.log('[Deploy] 🔄 Iniciando limpeza e re-deploy dos comandos...');

        // 1. Limpar todos os comandos globais existentes
        console.log('[Deploy] 🧹 Limpando comandos globais antigos...');
        await rest.put(Routes.applicationCommands(clientId), { body: [] });
        console.log('[Deploy] ✅ Comandos globais limpos!');

        // 2. Carregar novos comandos
        const fs = require('fs');
        const path = require('path');

        const commands = [];
        const commandsPath = path.join(__dirname, 'src', 'commands');

        if (fs.existsSync(commandsPath)) {
            const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

            for (const file of commandFiles) {
                const filePath = path.join(commandsPath, file);
                const command = require(filePath);

                if ('data' in command && 'execute' in command) {
                    commands.push(command.data.toJSON());
                    console.log(`[Deploy] 📄 Comando carregado: ${command.data.name}`);
                } else {
                    console.warn(`[Deploy] ⚠️  Comando em ${filePath} está faltando "data" ou "execute"`);
                }
            }
        }

        // 3. Registrar novos comandos
        if (commands.length > 0) {
            console.log(`[Deploy] 🚀 Registrando ${commands.length} comando(s)...`);

            const data = await rest.put(
                Routes.applicationCommands(clientId),
                { body: commands }
            );

            console.log(`[Deploy] ✅ ${data.length} comando(s) registrado(s) com sucesso!`);

            // Listar comandos registrados
            console.log('[Deploy] 📋 Comandos registrados:');
            data.forEach(command => {
                const subcommands = command.options?.filter(opt => opt.type === 1) || [];
                if (subcommands.length > 0) {
                    console.log(`  • ${command.name} (${subcommands.length} subcomandos)`);
                    subcommands.forEach(sub => {
                        console.log(`    - ${command.name} ${sub.name}`);
                    });
                } else {
                    console.log(`  • ${command.name}`);
                }
            });
        } else {
            console.log('[Deploy] ⚠️  Nenhum comando encontrado para registrar.');
        }

        console.log('[Deploy] 🎉 Deploy concluído com sucesso!');
        console.log('[Deploy] ℹ️  Os comandos podem demorar até 1 hora para aparecer globalmente.');
        console.log('[Deploy] 💡 Para teste imediato, use comandos em um servidor específico.');

    } catch (error) {
        console.error('[Deploy] ❌ Erro durante o deploy:', error);

        if (error.code === 50001) {
            console.error('[Deploy] 💡 Erro: Bot não tem acesso. Verifique se o bot está no servidor e tem permissões.');
        } else if (error.code === 20012) {
            console.error('[Deploy] 💡 Erro: Nome de comando inválido ou duplicado.');
        } else if (error.rawError?.message?.includes('rate limit')) {
            console.error('[Deploy] 💡 Erro: Rate limit. Tente novamente em alguns minutos.');
        }

        process.exit(1);
    }
}

// Função para limpar comandos de um servidor específico (útil para testes)
async function clearGuildCommands(guildId) {
    try {
        console.log(`[Deploy] 🧹 Limpando comandos do servidor ${guildId}...`);
        await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: [] });
        console.log(`[Deploy] ✅ Comandos do servidor ${guildId} limpos!`);
    } catch (error) {
        console.error(`[Deploy] ❌ Erro ao limpar comandos do servidor:`, error);
    }
}

// Função para registrar comandos em um servidor específico (para testes rápidos)
async function deployGuildCommands(guildId) {
    try {
        console.log(`[Deploy] 🚀 Registrando comandos no servidor ${guildId} para teste...`);

        const fs = require('fs');
        const path = require('path');

        const commands = [];
        const commandsPath = path.join(__dirname, 'src', 'commands');

        if (fs.existsSync(commandsPath)) {
            const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

            for (const file of commandFiles) {
                const filePath = path.join(commandsPath, file);
                const command = require(filePath);

                if ('data' in command && 'execute' in command) {
                    commands.push(command.data.toJSON());
                }
            }
        }

        const data = await rest.put(
            Routes.applicationGuildCommands(clientId, guildId),
            { body: commands }
        );

        console.log(`[Deploy] ✅ ${data.length} comando(s) registrado(s) no servidor para teste!`);
        console.log('[Deploy] ⚡ Comandos disponíveis imediatamente neste servidor!');
    } catch (error) {
        console.error('[Deploy] ❌ Erro ao registrar comandos no servidor:', error);
    }
}

// Verificar argumentos da linha de comando
const args = process.argv.slice(2);

if (args.length === 0) {
    // Deploy global padrão
    deployCommands();
} else if (args[0] === 'clear-guild' && args[1]) {
    // Limpar comandos de um servidor específico
    clearGuildCommands(args[1]);
} else if (args[0] === 'guild' && args[1]) {
    // Deploy em servidor específico para teste
    deployGuildCommands(args[1]);
} else if (args[0] === 'clear') {
    // Apenas limpar comandos globais
    rest.put(Routes.applicationCommands(clientId), { body: [] })
        .then(() => console.log('[Deploy] ✅ Comandos globais limpos!'))
        .catch(console.error);
} else {
    console.log(`
[Deploy] 📖 Uso:
  node deploy-commands.js              # Deploy global (padrão)
  node deploy-commands.js clear        # Limpar apenas comandos globais
  node deploy-commands.js guild <ID>   # Deploy em servidor específico (teste)
  node deploy-commands.js clear-guild <ID>  # Limpar comandos de servidor específico

Exemplos:
  node deploy-commands.js
  node deploy-commands.js guild 123456789012345678
  node deploy-commands.js clear-guild 123456789012345678
    `);
}
