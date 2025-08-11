const fs = require('fs');
const path = require('path');

// Diretório de dados configurável via variável de ambiente
const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), 'data');
const CONFIG_FILE = path.join(DATA_DIR, 'servers.json');

// Garante que o diretório de dados existe
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    console.log(`Diretório de dados criado: ${DATA_DIR}`);
}

/**
 * Carrega as configurações dos servidores do arquivo JSON
 * @returns {Object} Objeto com as configurações de todos os servidores
 */
function loadServerConfigs() {
    try {
        if (fs.existsSync(CONFIG_FILE)) {
            const data = fs.readFileSync(CONFIG_FILE, 'utf8');
            const configs = JSON.parse(data);
            console.log(`Configurações carregadas de: ${CONFIG_FILE}`);
            return configs;
        } else {
            console.log(`Arquivo de configuração não existe, criando novo: ${CONFIG_FILE}`);
        }
    } catch (error) {
        console.error('Erro ao carregar configurações:', error.message);
    }
    return {};
}

/**
 * Salva as configurações dos servidores no arquivo JSON
 * @param {Object} configs - Objeto com as configurações de todos os servidores
 */
function saveServerConfigs(configs) {
    try {
        fs.writeFileSync(CONFIG_FILE, JSON.stringify(configs, null, 2), 'utf8');
        console.log(`Configurações salvas em: ${CONFIG_FILE}`);
    } catch (error) {
        console.error('Erro ao salvar configurações:', error.message);
        console.error('Verifique se o diretório tem permissões de escrita:', DATA_DIR);
    }
}

/**
 * Obtém a configuração de um servidor específico
 * @param {string} guildId - ID do servidor
 * @returns {Object} Configuração do servidor
 */
function getServerConfig(guildId) {
    const configs = loadServerConfigs();
    return configs[guildId] || {
        welcome: {
            enabled: false,
            channelId: null,
            message: 'Bem-vindo(a) ao servidor, {user}! 🎉',
            useEmbed: false,
            embed: {
                title: 'Bem-vindo(a) ao {server}! 🎉',
                description: 'Olá {user}! Seja bem-vindo(a) ao nosso servidor!\n\nAgora somos **{memberCount}** membros!',
                color: 0x00ff00,
                thumbnail: null, // URL da thumbnail
                image: null,     // URL da imagem
                footer: 'Divirta-se conosco!'
            }
        }
    };
}

/**
 * Define a configuração de um servidor específico
 * @param {string} guildId - ID do servidor
 * @param {Object} config - Nova configuração do servidor
 */
function setServerConfig(guildId, config) {
    const configs = loadServerConfigs();
    configs[guildId] = config;
    saveServerConfigs(configs);
}

/**
 * Atualiza apenas a configuração de boas-vindas de um servidor
 * @param {string} guildId - ID do servidor
 * @param {Object} welcomeConfig - Nova configuração de boas-vindas
 */
function setWelcomeConfig(guildId, welcomeConfig) {
    const config = getServerConfig(guildId);
    config.welcome = { ...config.welcome, ...welcomeConfig };
    setServerConfig(guildId, config);
}

module.exports = {
    getServerConfig,
    setServerConfig,
    setWelcomeConfig
};
