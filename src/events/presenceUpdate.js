// Variável de controle para ativar/desativar o debug (usando variável de ambiente)
const DEBUG_MODE = process.env.DEBUG_MODE === 'true';

/**
 * Evento acionado quando o status de presença de um membro é atualizado.
 * Ele verifica se o membro está jogando "Once Human" e altera seu apelido
 * com base no estado do jogo (que deve conter a string no formato "Nome lv Nível").
 *
 * @param {Presence} oldPresence - O estado anterior de presença do membro.
 * @param {Presence} newPresence - O novo estado de presença do membro.
 */
module.exports = async (oldPresence, newPresence) => {
    const member = newPresence.member;
    const activities = newPresence.activities;

    // Verifica se o usuário possui atividades
    if (activities.length > 0) {
        activities.forEach((activity) => {
            // Verifica se o membro está jogando "Once Human"
            if (activity.type == 0 && activity.name == 'Once Human') {
                const state = activity.state;
                let newNickname = member.nickname;

                // Se houver um "state", tenta formatar o apelido com base nele
                if (state != null)
                    newNickname = formatNickname(state);

                // Verifica se o novo apelido é diferente do apelido atual
                if (newNickname && member.nickname !== newNickname) {
                    member.setNickname(newNickname).then((result) => {
                        if (DEBUG_MODE) console.log(result); // Debug: imprime o resultado da alteração
                        if (DEBUG_MODE) console.log(`Apelido alterado para ${newNickname} para ${member.user.tag}`);
                    }).catch((error) => {
                        console.error('Erro ao alterar o apelido:', error);
                    });
                } else {
                    if (DEBUG_MODE) console.log(`Apelido do ${member.user.tag} não foi alterado, state: ${state}`);
                }
            } else {
                // Debug: imprime informações da atividade
                if (DEBUG_MODE) console.log(`Atividade do ${member.user.tag} não foi alterada, type: ${activity.type}, name: ${activity.name}, state: ${activity.state}, url: ${activity.url}, details: ${activity.details}`);
            }
        });
    } else {
        // Debug: imprime se o membro não estiver jogando
        if (DEBUG_MODE) console.log(`${member.user.tag} não está jogando no momento`);
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
        const name = match[1];
        const level = match[2];
        return `[${level}] ${name}`;
    } else {
        return null;
    }
}
