const { getServerConfig } = require('../config/serverConfig');
const { EmbedBuilder } = require('discord.js');

// Variável de controle para ativar/desativar o debug (usando variável de ambiente)
const DEBUG = process.env.DEBUG === 'true';

/**
 * Substitui placeholders em uma string
 * @param {string} text - Texto para substituir placeholders
 * @param {GuildMember} member - Membro do servidor
 * @returns {string} Texto com placeholders substituídos
 */
function replacePlaceholders(text, member) {
    if (!text) return text;

    return text
        .replace(/{user}/g, `<@${member.user.id}>`)
        .replace(/{username}/g, member.user.username)
        .replace(/{displayName}/g, member.displayName)
        .replace(/{server}/g, member.guild.name)
        .replace(/{memberCount}/g, member.guild.memberCount);
}

/**
 * Evento acionado quando um novo membro entra no servidor.
 * Envia uma mensagem de boas-vindas se estiver configurado.
 *
 * @param {GuildMember} member - O membro que entrou no servidor
 */
module.exports = async (member) => {
    try {
        // Ignora bots
        if (member.user.bot) return;

        const guildId = member.guild.id;
        const config = getServerConfig(guildId);

        // Verifica se as boas-vindas estão habilitadas
        if (!config.welcome.enabled) {
            if (DEBUG) console.log(`Boas-vindas desabilitadas para ${member.guild.name}`);
            return;
        }

        // Verifica se há um canal configurado
        if (!config.welcome.channelId) {
            if (DEBUG) console.log(`Canal de boas-vindas não configurado para ${member.guild.name}`);
            return;
        }

        // Busca o canal configurado
        const welcomeChannel = member.guild.channels.cache.get(config.welcome.channelId);
        if (!welcomeChannel) {
            console.warn(`Canal de boas-vindas não encontrado (ID: ${config.welcome.channelId}) em ${member.guild.name}`);
            return;
        }

        // Verifica se o bot tem permissão para enviar mensagens no canal
        if (!welcomeChannel.permissionsFor(member.guild.members.me).has(['SendMessages', 'EmbedLinks'])) {
            console.warn(`Bot não tem permissão para enviar mensagens ou embeds no canal de boas-vindas em ${member.guild.name}`);
            return;
        }

        // Prepara a mensagem de boas-vindas
        let messageOptions = {};

        if (config.welcome.useEmbed && config.welcome.embed) {
            // Cria embed personalizado
            const embed = new EmbedBuilder();

            // Configura campos do embed
            if (config.welcome.embed.title) {
                embed.setTitle(replacePlaceholders(config.welcome.embed.title, member));
            }

            if (config.welcome.embed.description) {
                embed.setDescription(replacePlaceholders(config.welcome.embed.description, member));
            }

            if (config.welcome.embed.color) {
                embed.setColor(config.welcome.embed.color);
            }

            if (config.welcome.embed.thumbnail) {
                embed.setThumbnail(config.welcome.embed.thumbnail === '{userAvatar}'
                    ? member.user.displayAvatarURL({ dynamic: true, size: 256 })
                    : config.welcome.embed.thumbnail);
            }

            if (config.welcome.embed.image) {
                embed.setImage(config.welcome.embed.image === '{guildIcon}'
                    ? member.guild.iconURL({ dynamic: true, size: 512 })
                    : config.welcome.embed.image);
            }

            if (config.welcome.embed.footer) {
                embed.setFooter({
                    text: replacePlaceholders(config.welcome.embed.footer, member)
                });
            }

            // Adiciona timestamp
            embed.setTimestamp();

            messageOptions.embeds = [embed];
        } else {
            // Mensagem simples
            let welcomeMessage = config.welcome.message || 'Bem-vindo(a) ao servidor, {user}! 🎉';
            messageOptions.content = replacePlaceholders(welcomeMessage, member);
        }

        // Envia a mensagem de boas-vindas
        await welcomeChannel.send(messageOptions);

        console.log(`✅ Mensagem de boas-vindas enviada para ${member.user.tag} em ${member.guild.name}`);

    } catch (error) {
        console.error(`❌ Erro ao enviar mensagem de boas-vindas:`, error.message);
    }
};
