const { SlashCommandBuilder, PermissionFlagsBits, ChannelType, EmbedBuilder } = require('discord.js');
const { getServerConfig, setWelcomeConfig } = require('../config/serverConfig');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('welcome')
        .setDescription('Configura o sistema de boas-vindas do servidor')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addSubcommand(subcommand =>
            subcommand
                .setName('enable')
                .setDescription('Habilita as mensagens de boas-vindas')
                .addChannelOption(option =>
                    option
                        .setName('canal')
                        .setDescription('Canal onde as mensagens de boas-vindas serão enviadas')
                        .addChannelTypes(ChannelType.GuildText)
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('disable')
                .setDescription('Desabilita as mensagens de boas-vindas')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('message')
                .setDescription('Define a mensagem de boas-vindas simples')
                .addStringOption(option =>
                    option
                        .setName('texto')
                        .setDescription('Mensagem de boas-vindas (use {user}, {username}, {server}, {memberCount})')
                        .setRequired(true)
                        .setMaxLength(2000)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('embed')
                .setDescription('Configura boas-vindas com embed')
                .addBooleanOption(option =>
                    option
                        .setName('ativar')
                        .setDescription('Usar embed ao invés de mensagem simples')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('embed-title')
                .setDescription('Define o título do embed')
                .addStringOption(option =>
                    option
                        .setName('titulo')
                        .setDescription('Título do embed (placeholders disponíveis)')
                        .setRequired(true)
                        .setMaxLength(256)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('embed-description')
                .setDescription('Define a descrição do embed')
                .addStringOption(option =>
                    option
                        .setName('descricao')
                        .setDescription('Descrição do embed (placeholders disponíveis)')
                        .setRequired(true)
                        .setMaxLength(4096)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('embed-color')
                .setDescription('Define a cor do embed')
                .addStringOption(option =>
                    option
                        .setName('cor')
                        .setDescription('Cor em hexadecimal (ex: #00ff00) ou nome da cor')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('embed-thumbnail')
                .setDescription('Define a thumbnail do embed')
                .addStringOption(option =>
                    option
                        .setName('url')
                        .setDescription('URL da imagem ou {userAvatar} para avatar do usuário')
                        .setRequired(false)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('embed-image')
                .setDescription('Define a imagem do embed')
                .addStringOption(option =>
                    option
                        .setName('url')
                        .setDescription('URL da imagem ou {guildIcon} para ícone do servidor')
                        .setRequired(false)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('embed-footer')
                .setDescription('Define o rodapé do embed')
                .addStringOption(option =>
                    option
                        .setName('texto')
                        .setDescription('Texto do rodapé (placeholders disponíveis)')
                        .setRequired(true)
                        .setMaxLength(2048)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('test')
                .setDescription('Testa a mensagem de boas-vindas atual')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('status')
                .setDescription('Mostra a configuração atual das boas-vindas')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('export')
                .setDescription('Exporta a configuração atual em formato copiável')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('clear-title')
                .setDescription('Remove o título do embed')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('clear-description')
                .setDescription('Remove a descrição do embed')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('clear-thumbnail')
                .setDescription('Remove a thumbnail do embed')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('clear-image')
                .setDescription('Remove a imagem do embed')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('clear-footer')
                .setDescription('Remove o rodapé do embed')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('reset-embed')
                .setDescription('Remove todas as personalizações do embed')
        ),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const guildId = interaction.guild.id;
        const config = getServerConfig(guildId);

        // Função para converter cor
        function parseColor(colorString) {
            const colors = {
                'red': 0xff0000, 'green': 0x00ff00, 'blue': 0x0000ff,
                'yellow': 0xffff00, 'orange': 0xffa500, 'purple': 0x800080,
                'pink': 0xffc0cb, 'cyan': 0x00ffff, 'white': 0xffffff,
                'black': 0x000000, 'gray': 0x808080, 'grey': 0x808080
            };

            if (colors[colorString.toLowerCase()]) {
                return colors[colorString.toLowerCase()];
            }

            if (colorString.startsWith('#')) {
                return parseInt(colorString.substring(1), 16);
            }

            return parseInt(colorString, 16);
        }

        // Função para substituir placeholders em preview
        function replacePlaceholders(text, member) {
            if (!text) return text;

            return text
                .replace(/\\n/g, '\n') // Converte \n em quebras de linha reais
                .replace(/{user}/g, `<@${member.user.id}>`)
                .replace(/{username}/g, member.user.username)
                .replace(/{displayName}/g, member.displayName)
                .replace(/{server}/g, member.guild.name)
                .replace(/{memberCount}/g, member.guild.memberCount);
        }

        // Função para processar texto de entrada (converte \n em quebras reais)
        function processInputText(text) {
            if (!text) return text;
            return text.replace(/\\n/g, '\n');
        }

        try {
            switch (subcommand) {
                case 'enable': {
                    const channel = interaction.options.getChannel('canal');

                    if (!channel.permissionsFor(interaction.guild.members.me).has(['SendMessages', 'ViewChannel', 'EmbedLinks'])) {
                        return interaction.reply({
                            content: '❌ Eu não tenho permissão para enviar mensagens ou embeds neste canal!',
                            ephemeral: true
                        });
                    }

                    setWelcomeConfig(guildId, {
                        enabled: true,
                        channelId: channel.id
                    });

                    const embedInfo = config.welcome.useEmbed ?
                        '\n🎨 **Modo:** Embed personalizado' :
                        '\n📝 **Modo:** Mensagem simples';

                    return interaction.reply({
                        content: `✅ Mensagens de boas-vindas habilitadas no canal ${channel}!${embedInfo}\n\n` +
                                `Use \`/welcome embed ativar:true\` para usar embeds ou \`/welcome message\` para mensagem simples.`,
                        ephemeral: true
                    });
                }

                case 'disable': {
                    setWelcomeConfig(guildId, { enabled: false });
                    return interaction.reply({
                        content: '✅ Mensagens de boas-vindas desabilitadas!',
                        ephemeral: true
                    });
                }

                case 'message': {
                    const rawMessage = interaction.options.getString('texto');
                    const newMessage = processInputText(rawMessage);
                    setWelcomeConfig(guildId, {
                        message: newMessage,
                        useEmbed: false
                    });

                    return interaction.reply({
                        content: `✅ Mensagem simples de boas-vindas atualizada!\n\n**Nova mensagem:** ${rawMessage}`,
                        ephemeral: true
                    });
                }

                case 'embed': {
                    const useEmbed = interaction.options.getBoolean('ativar');
                    setWelcomeConfig(guildId, { useEmbed });

                    return interaction.reply({
                        content: useEmbed ?
                            '✅ Modo embed ativado! Use os comandos `/welcome embed-*` para configurar.' :
                            '✅ Modo embed desativado! Usando mensagem simples.',
                        ephemeral: true
                    });
                }

                case 'embed-title': {
                    const rawTitle = interaction.options.getString('titulo');
                    const title = processInputText(rawTitle);
                    const newEmbed = { ...config.welcome.embed, title };
                    setWelcomeConfig(guildId, { embed: newEmbed });

                    return interaction.reply({
                        content: `✅ Título do embed atualizado!\n**Novo título:** ${rawTitle}`,
                        ephemeral: true
                    });
                }

                case 'embed-description': {
                    const rawDescription = interaction.options.getString('descricao');
                    const description = processInputText(rawDescription);
                    const newEmbed = { ...config.welcome.embed, description };
                    setWelcomeConfig(guildId, { embed: newEmbed });

                    return interaction.reply({
                        content: `✅ Descrição do embed atualizada!\n**Nova descrição:** ${rawDescription}`,
                        ephemeral: true
                    });
                }

                case 'embed-color': {
                    const colorString = interaction.options.getString('cor');
                    try {
                        const color = parseColor(colorString);
                        const newEmbed = { ...config.welcome.embed, color };
                        setWelcomeConfig(guildId, { embed: newEmbed });

                        return interaction.reply({
                            content: `✅ Cor do embed atualizada!\n**Nova cor:** ${colorString}`,
                            ephemeral: true
                        });
                    } catch (error) {
                        return interaction.reply({
                            content: '❌ Cor inválida! Use formato hexadecimal (#00ff00) ou nome da cor (green, red, blue, etc.)',
                            ephemeral: true
                        });
                    }
                }

                case 'embed-thumbnail': {
                    const url = interaction.options.getString('url');
                    const newEmbed = { ...config.welcome.embed, thumbnail: url };
                    setWelcomeConfig(guildId, { embed: newEmbed });

                    return interaction.reply({
                        content: url ?
                            `✅ Thumbnail do embed atualizada!\n**URL:** ${url}` :
                            '✅ Thumbnail do embed removida!',
                        ephemeral: true
                    });
                }

                case 'embed-image': {
                    const url = interaction.options.getString('url');
                    const newEmbed = { ...config.welcome.embed, image: url };
                    setWelcomeConfig(guildId, { embed: newEmbed });

                    return interaction.reply({
                        content: url ?
                            `✅ Imagem do embed atualizada!\n**URL:** ${url}` :
                            '✅ Imagem do embed removida!',
                        ephemeral: true
                    });
                }

                case 'embed-footer': {
                    const rawFooter = interaction.options.getString('texto');
                    const footer = processInputText(rawFooter);
                    const newEmbed = { ...config.welcome.embed, footer };
                    setWelcomeConfig(guildId, { embed: newEmbed });

                    return interaction.reply({
                        content: `✅ Rodapé do embed atualizado!\n**Novo rodapé:** ${rawFooter}`,
                        ephemeral: true
                    });
                }

                case 'test': {
                    if (!config.welcome.enabled) {
                        return interaction.reply({
                            content: '❌ As mensagens de boas-vindas estão desabilitadas!',
                            ephemeral: true
                        });
                    }

                    if (!config.welcome.channelId) {
                        return interaction.reply({
                            content: '❌ Canal de boas-vindas não configurado!',
                            ephemeral: true
                        });
                    }

                    const channel = interaction.guild.channels.cache.get(config.welcome.channelId);
                    if (!channel) {
                        return interaction.reply({
                            content: '❌ Canal de boas-vindas não encontrado!',
                            ephemeral: true
                        });
                    }

                    // Cria mensagem de teste
                    let messageOptions = { content: '🧪 **TESTE DE BOAS-VINDAS:**\n' };

                    if (config.welcome.useEmbed && config.welcome.embed) {
                        const embed = new EmbedBuilder();

                        if (config.welcome.embed.title) {
                            embed.setTitle(replacePlaceholders(config.welcome.embed.title, interaction.member));
                        }

                        if (config.welcome.embed.description) {
                            embed.setDescription(replacePlaceholders(config.welcome.embed.description, interaction.member));
                        }

                        if (config.welcome.embed.color) {
                            embed.setColor(config.welcome.embed.color);
                        }

                        if (config.welcome.embed.thumbnail) {
                            embed.setThumbnail(config.welcome.embed.thumbnail === '{userAvatar}'
                                ? interaction.user.displayAvatarURL({ dynamic: true, size: 256 })
                                : config.welcome.embed.thumbnail);
                        }

                        if (config.welcome.embed.image) {
                            embed.setImage(config.welcome.embed.image === '{guildIcon}'
                                ? interaction.guild.iconURL({ dynamic: true, size: 512 })
                                : config.welcome.embed.image);
                        }

                        if (config.welcome.embed.footer) {
                            embed.setFooter({
                                text: replacePlaceholders(config.welcome.embed.footer, interaction.member)
                            });
                        }

                        embed.setTimestamp();
                        messageOptions.embeds = [embed];
                    } else {
                        const testMessage = replacePlaceholders(config.welcome.message, interaction.member);
                        messageOptions.content += testMessage;
                    }

                    await channel.send(messageOptions);

                    return interaction.reply({
                        content: `✅ Mensagem de teste enviada em ${channel}!`,
                        ephemeral: true
                    });
                }

                case 'status': {
                    const channel = config.welcome.channelId ?
                        interaction.guild.channels.cache.get(config.welcome.channelId) : null;

                    const status = config.welcome.enabled ? '✅ Habilitado' : '❌ Desabilitado';
                    const channelInfo = channel ? `${channel}` : 'Não configurado';
                    const mode = config.welcome.useEmbed ? '🎨 Embed personalizado' : '📝 Mensagem simples';

                    let response = `📋 **Status das Boas-vindas:**\n\n` +
                                   `**Status:** ${status}\n` +
                                   `**Canal:** ${channelInfo}\n` +
                                   `**Modo:** ${mode}\n\n`;

                    if (config.welcome.useEmbed) {
                        response += `**Configuração do Embed:**\n` +
                                   `• **Título:** ${config.welcome.embed.title || 'Não definido'}\n` +
                                   `• **Descrição:** ${config.welcome.embed.description || 'Não definida'}\n` +
                                   `• **Cor:** #${config.welcome.embed.color?.toString(16).padStart(6, '0') || '000000'}\n` +
                                   `• **Thumbnail:** ${config.welcome.embed.thumbnail || 'Não definida'}\n` +
                                   `• **Imagem:** ${config.welcome.embed.image || 'Não definida'}\n` +
                                   `• **Rodapé:** ${config.welcome.embed.footer || 'Não definido'}\n\n`;
                    } else {
                        response += `**Mensagem atual:**\n\`\`\`\n${config.welcome.message}\n\`\`\`\n\n`;
                    }

                    response += `💡 **Dica:** Use \`/welcome export\` para obter comandos prontos para copiar!\n\n`;

                    response += `**Placeholders disponíveis:**\n` +
                               `• \`{user}\` - Menciona o usuário\n` +
                               `• \`{username}\` - Nome do usuário\n` +
                               `• \`{displayName}\` - Nome de exibição\n` +
                               `• \`{server}\` - Nome do servidor\n` +
                               `• \`{memberCount}\` - Número de membros\n` +
                               `• \`{userAvatar}\` - Avatar do usuário (thumbnail/image)\n` +
                               `• \`{guildIcon}\` - Ícone do servidor (thumbnail/image)`;

                    return interaction.reply({
                        content: response,
                        ephemeral: true
                    });
                }

                case 'export': {
                    const channel = config.welcome.channelId ?
                        interaction.guild.channels.cache.get(config.welcome.channelId) : null;

                    if (!config.welcome.enabled) {
                        return interaction.reply({
                            content: '❌ Boas-vindas estão desabilitadas! Nada para exportar.',
                            ephemeral: true
                        });
                    }

                    // Função para escapar aspas e caracteres especiais
                    function escapeText(text) {
                        if (!text) return '';
                        return text.replace(/"/g, '\\"').replace(/\n/g, '\\n');
                    }

                    let exportCommands = `📤 **Configuração Atual (Pronta para Copiar):**\n\n`;

                    // Canal
                    if (channel) {
                        exportCommands += `\`\`\`\n/welcome enable canal:${channel}\n\`\`\`\n`;
                    }

                    if (config.welcome.useEmbed) {
                        // Configuração de embed
                        exportCommands += `**Modo Embed:**\n\`\`\`\n`;
                        exportCommands += `/welcome embed ativar:true\n`;

                        if (config.welcome.embed.title) {
                            exportCommands += `/welcome embed-title titulo:"${escapeText(config.welcome.embed.title)}"\n`;
                        }

                        if (config.welcome.embed.description) {
                            exportCommands += `/welcome embed-description descricao:"${escapeText(config.welcome.embed.description)}"\n`;
                        }

                        if (config.welcome.embed.color) {
                            const colorHex = `#${config.welcome.embed.color.toString(16).padStart(6, '0')}`;
                            exportCommands += `/welcome embed-color cor:"${colorHex}"\n`;
                        }

                        if (config.welcome.embed.thumbnail) {
                            exportCommands += `/welcome embed-thumbnail url:"${config.welcome.embed.thumbnail}"\n`;
                        }

                        if (config.welcome.embed.image) {
                            exportCommands += `/welcome embed-image url:"${config.welcome.embed.image}"\n`;
                        }

                        if (config.welcome.embed.footer) {
                            exportCommands += `/welcome embed-footer texto:"${escapeText(config.welcome.embed.footer)}"\n`;
                        }

                        exportCommands += `\`\`\`\n`;
                    } else {
                        // Configuração de mensagem simples
                        exportCommands += `**Modo Mensagem Simples:**\n\`\`\`\n`;
                        exportCommands += `/welcome message texto:"${escapeText(config.welcome.message)}"\n`;
                        exportCommands += `\`\`\`\n`;
                    }

                    exportCommands += `\n💡 **Como usar:**\n`;
                    exportCommands += `1. Copie os comandos acima\n`;
                    exportCommands += `2. Cole um por vez no Discord\n`;
                    exportCommands += `3. Execute para recriar a configuração\n`;
                    exportCommands += `4. Modifique os textos conforme necessário`;

                    return interaction.reply({
                        content: exportCommands,
                        ephemeral: true
                    });
                }

                case 'clear-title': {
                    if (!config.welcome.useEmbed) {
                        return interaction.reply({
                            content: '❌ O modo embed não está ativado! Use `/welcome embed ativar:true` primeiro.',
                            ephemeral: true
                        });
                    }

                    setWelcomeConfig(guildId, {
                        ...config.welcome,
                        embed: {
                            ...config.welcome.embed,
                            title: null
                        }
                    });

                    return interaction.reply({
                        content: '✅ Título do embed removido com sucesso!',
                        ephemeral: true
                    });
                }

                case 'clear-description': {
                    if (!config.welcome.useEmbed) {
                        return interaction.reply({
                            content: '❌ O modo embed não está ativado! Use `/welcome embed ativar:true` primeiro.',
                            ephemeral: true
                        });
                    }

                    setWelcomeConfig(guildId, {
                        ...config.welcome,
                        embed: {
                            ...config.welcome.embed,
                            description: null
                        }
                    });

                    return interaction.reply({
                        content: '✅ Descrição do embed removida com sucesso!',
                        ephemeral: true
                    });
                }

                case 'clear-thumbnail': {
                    if (!config.welcome.useEmbed) {
                        return interaction.reply({
                            content: '❌ O modo embed não está ativado! Use `/welcome embed ativar:true` primeiro.',
                            ephemeral: true
                        });
                    }

                    setWelcomeConfig(guildId, {
                        ...config.welcome,
                        embed: {
                            ...config.welcome.embed,
                            thumbnail: null
                        }
                    });

                    return interaction.reply({
                        content: '✅ Thumbnail do embed removida com sucesso!',
                        ephemeral: true
                    });
                }

                case 'clear-image': {
                    if (!config.welcome.useEmbed) {
                        return interaction.reply({
                            content: '❌ O modo embed não está ativado! Use `/welcome embed ativar:true` primeiro.',
                            ephemeral: true
                        });
                    }

                    setWelcomeConfig(guildId, {
                        ...config.welcome,
                        embed: {
                            ...config.welcome.embed,
                            image: null
                        }
                    });

                    return interaction.reply({
                        content: '✅ Imagem do embed removida com sucesso!',
                        ephemeral: true
                    });
                }

                case 'clear-footer': {
                    if (!config.welcome.useEmbed) {
                        return interaction.reply({
                            content: '❌ O modo embed não está ativado! Use `/welcome embed ativar:true` primeiro.',
                            ephemeral: true
                        });
                    }

                    setWelcomeConfig(guildId, {
                        ...config.welcome,
                        embed: {
                            ...config.welcome.embed,
                            footer: null
                        }
                    });

                    return interaction.reply({
                        content: '✅ Rodapé do embed removido com sucesso!',
                        ephemeral: true
                    });
                }

                case 'reset-embed': {
                    if (!config.welcome.useEmbed) {
                        return interaction.reply({
                            content: '❌ O modo embed não está ativado! Use `/welcome embed ativar:true` primeiro.',
                            ephemeral: true
                        });
                    }

                    setWelcomeConfig(guildId, {
                        ...config.welcome,
                        embed: {
                            title: 'Bem-vindo(a) ao {server}! 🎉',
                            description: 'Olá {user}! Seja bem-vindo(a) ao nosso servidor!\n\nAgora somos **{memberCount}** membros!',
                            color: 0x00ff00,
                            thumbnail: null,
                            image: null,
                            footer: 'Divirta-se conosco!'
                        }
                    });

                    return interaction.reply({
                        content: '✅ Embed resetado para configuração padrão!\n\n' +
                                '🔄 **Configuração aplicada:**\n' +
                                '• **Título:** Bem-vindo(a) ao {server}! 🎉\n' +
                                '• **Descrição:** Mensagem padrão com placeholders\n' +
                                '• **Cor:** Verde (#00ff00)\n' +
                                '• **Thumbnail:** Removida\n' +
                                '• **Imagem:** Removida\n' +
                                '• **Rodapé:** Divirta-se conosco!',
                        ephemeral: true
                    });
                }
            }
        } catch (error) {
            console.error('Erro no comando welcome:', error);
            return interaction.reply({
                content: '❌ Ocorreu um erro ao executar o comando!',
                ephemeral: true
            });
        }
    }
};
