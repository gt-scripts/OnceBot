// Variável de controle para ativar/desativar o debug (usando variável de ambiente)
const DEBUG = process.env.DEBUG === 'true';

/**
 * Evento acionado quando o status de presença de um membro é atualizado.
 * Ele verifica se o membro está jogando "Once Human" e altera seu apelido
 * com base no estado do jogo (que deve conter a string no formato "Nome lv Nível").
 *
 * @param {Presence} oldPresence - O estado anterior de presença do membro.
 * @param {Presence} newPresence - O novo estado de presença do membro.
 */
module.exports = async (oldPresence, newPresence) => {
    // Verificações de segurança
    if (!newPresence || !newPresence.member) return;

    const member = newPresence.member;
    const activities = newPresence.activities;

    // Ignora bots e o próprio bot
    if (member.user.bot) return;

    // Verifica se o bot tem permissão para alterar apelidos
    if (!member.guild.members.me.permissions.has('ManageNicknames')) {
        console.warn(`Bot não tem permissão para alterar apelidos no servidor: ${member.guild.name}`);
        return;
    }

    // Verifica se o bot pode alterar o apelido deste membro específico
    if (member.roles.highest.position >= member.guild.members.me.roles.highest.position) {
        if (DEBUG) console.log(`Não é possível alterar o apelido de ${member.user.tag} - cargo superior ou igual ao do bot`);
        return;
    }

    // Verifica se o usuário possui atividades
    if (activities.length > 0) {
        let foundOnceHuman = false;

        for (const activity of activities) {
            // Verifica se o membro está jogando "Once Human"
            if (activity.type == 0 && activity.name == 'Once Human') {
                foundOnceHuman = true;
                const state = activity.state;
                let newNickname = null;
                const currentNickname = member.nickname || member.user.displayName;

                if (DEBUG) console.log(`${member.user.tag} está jogando Once Human - State: "${state}"`);

                // Se houver um "state", tenta formatar o apelido com base nele
                if (state != null) {
                    newNickname = formatNickname(state);
                    if (DEBUG && !newNickname) {
                        console.log(`State "${state}" não corresponde ao formato esperado para ${member.user.tag}`);
                    }
                }

                // Verifica se o novo apelido é válido e diferente do atual
                if (newNickname && currentNickname !== newNickname) {
                    try {
                        await member.setNickname(newNickname);
                        console.log(`✅ Apelido alterado para "${newNickname}" para ${member.user.tag}`);
                    } catch (error) {
                        console.error(`❌ Erro ao alterar o apelido de ${member.user.tag}:`, error.message);
                    }
                } else {
                    if (DEBUG) console.log(`Apelido de ${member.user.tag} mantido como "${currentNickname}"`);
                }
                break; // Encontrou Once Human, não precisa verificar outras atividades
            }
        }

        // Log apenas em debug se não encontrou Once Human
        if (!foundOnceHuman && DEBUG) {
            console.log(`${member.user.tag} não está jogando Once Human (atividades: ${activities.map(a => a.name).join(', ')})`);
        }
    } else {
        // Debug: imprime se o membro não estiver jogando
        if (DEBUG) console.log(`${member.user.tag} não possui atividades ativas`);
    }
};

/**
 * Função responsável por formatar o apelido com base no formato "Nome lv Nível".
 * Extrai o nome e o nível da string e retorna no formato "[Nível] Nome".
 *
 * @param {string} string - A string que contém o nome e nível no formato "Nome lv Nível".
 * @returns {string|null} O apelido formatado ou null se a string não seguir o formato esperado.
 */
function formatNickname(string) {
    // Expressão regular para capturar o nome e o nível da string
    const regex = /^(.+)\s+lv\s+(\d+)$/i;
    const match = string.match(regex);

    // Se a string corresponder ao formato esperado, formata o apelido
    if (match) {
        const name = match[1].trim();
        const level = match[2];
        const formattedNickname = `[${level}] ${name}`;

        // Verifica se o apelido não excede o limite do Discord (32 caracteres)
        if (formattedNickname.length > 32) {
            // Trunca o nome se necessário, mantendo o formato [nível]
            const maxNameLength = 32 - `[${level}] `.length;
            const truncatedName = name.substring(0, maxNameLength);
            const result = `[${level}] ${truncatedName}`;
            if (DEBUG) console.log(`Apelido truncado: "${formattedNickname}" → "${result}"`);
            return result;
        }

        return formattedNickname;
    } else {
        return null;
    }
}
