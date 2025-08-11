# OnceBot
Once Human Discord Bot

Bot Discord especializado para o jogo Once Human, com sistema completo de boas-vindas e monitoramento de atividade.

## 🚀 Instalação e Execução

### Opção 1: Docker (Recomendado)

1. **Clone o repositório:**
```bash
git clone <repo-url>
cd OnceBot
```

2. **Configure as variáveis de ambiente:**
```bash
cp .env.example .env
# Edite o arquivo .env com suas configurações
```

3. **Inicie com Docker Compose:**
```bash
docker-compose up -d
```

4. **Visualize logs:**
```bash
docker-compose logs -f once-bot
```

### Opção 2: Desenvolvimento Local

1. **Instale as dependências:**
```bash
npm install
```

2. **Configure as variáveis de ambiente:**
```bash
cp .env.example .env
# Edite o arquivo .env
```

3. **Registre os comandos:**
```bash
npm run deploy
```

4. **Inicie o bot:**
```bash
npm start
```

## 📁 Estrutura de Dados

### Volumes Docker
- `./bot-data/` - Dados persistentes quando usando Docker Compose
- Configurações salvas em `bot-data/servers.json`

### Desenvolvimento Local
- `./data/` - Dados locais para desenvolvimento
- Configurações salvas em `data/servers.json`

## 🔧 Comandos NPM

- `npm start` - Inicia o bot
- `npm run deploy` - Registra comandos Discord
- `npm run dev` - Desenvolvimento com auto-reload (se disponível)

## 🐳 Comandos Docker

- `docker-compose up -d` - Inicia o bot em background
- `docker-compose down` - Para o bot
- `docker-compose logs -f` - Visualiza logs em tempo real
- `docker-compose restart` - Reinicia o bot
- `docker-compose pull && docker-compose up -d` - Atualiza e reinicia

## 📚 Documentação

## Sistema de Boas-vindas - OnceBot

### Visão Geral
Sistema completo de boas-vindas para Discord com suporte a embeds personalizados, placeholders dinâmicos e configuração por servidor.

### Funcionalidades

#### ✅ Funcionalidades Principais
- **Mensagens de boas-vindas** automáticas para novos membros
- **Suporte a embeds** com customização completa
- **Placeholders dinâmicos** para personalização
- **Configuração por servidor** individual
- **Sistema de export/import** de configurações
- **Comandos de teste** para validação
- **Persistência** em arquivo JSON

#### 🎨 Tipos de Mensagem
1. **Mensagem simples** - Texto puro com placeholders
2. **Embed personalizado** - Rica formatação visual

### Comandos Disponíveis

#### Configuração Básica
```
/welcome enable canal:#boas-vindas    # Ativa e define canal
/welcome disable                      # Desativa sistema
/welcome status                       # Mostra configuração atual
/welcome export                       # Exporta configuração copiável
```

#### Mensagem Simples
```
/welcome message texto:"Bem-vindo {user} ao {server}!"
```

#### Configuração de Embed
```
/welcome embed ativar:true                                    # Ativa modo embed
/welcome embed-title titulo:"🎉 Bem-vindo!"                  # Define título
/welcome embed-description descricao:"Olá {user}!"           # Define descrição
/welcome embed-color cor:"#00ff00"                           # Define cor (hex)
/welcome embed-thumbnail url:"{userAvatar}"                  # Thumbnail (avatar)
/welcome embed-image url:"{guildIcon}"                       # Imagem principal
/welcome embed-footer texto:"Membro #{memberCount}"          # Rodapé
```

#### Teste e Validação
```
/welcome test      # Simula boas-vindas com sua conta
/welcome status    # Visualiza configuração completa
/welcome export    # Gera comandos prontos para copiar
```

### Placeholders Disponíveis

| Placeholder | Descrição | Exemplo |
|-------------|-----------|---------|
| `{user}` | Menciona o usuário | @João |
| `{username}` | Nome do usuário | João |
| `{displayName}` | Nome de exibição | João Silva |
| `{server}` | Nome do servidor | Meu Servidor |
| `{memberCount}` | Número de membros | 150 |
| `{userAvatar}` | URL do avatar | https://... |
| `{guildIcon}` | URL do ícone do servidor | https://... |

### Exemplos de Uso

#### Mensagem Simples
```
/welcome message texto:"🎉 Bem-vindo {user} ao {server}!\nVocê é nosso {memberCount}º membro!"
```

#### Embed Completo
```
/welcome embed ativar:true
/welcome embed-title titulo:"🎉 Bem-vindo ao {server}!"
/welcome embed-description descricao:"Olá {user}!\n\nSeja muito bem-vindo(a) ao nosso servidor!\nVocê é nosso membro número {memberCount}."
/welcome embed-color cor:"#7289da"
/welcome embed-thumbnail url:"{userAvatar}"
/welcome embed-image url:"{guildIcon}"
/welcome embed-footer texto:"Membro desde"
```

### Funcionalidade Export

#### Como usar o Export
1. Execute `/welcome export`
2. Copie os comandos gerados
3. Execute um por vez para recriar a configuração
4. Modifique conforme necessário

#### Benefícios
- **Backup** de configurações
- **Migração** entre servidores
- **Compartilhamento** de templates
- **Teste** de configurações

### Arquivos do Sistema

#### Arquivos Principais
- `src/commands/welcome.js` - Comandos slash (13 subcomandos)
- `src/events/guildMemberAdd.js` - Evento de novo membro
- `src/utils/serverConfig.js` - Gerenciamento de configurações
- `data/serverConfigs.json` - Armazenamento persistente

#### Estrutura de Configuração
```json
{
  "guildId": {
    "welcome": {
      "enabled": true,
      "channelId": "123456789",
      "useEmbed": true,
      "message": "Texto da mensagem",
      "embed": {
        "title": "Título do embed",
        "description": "Descrição",
        "color": 7506394,
        "thumbnail": "URL",
        "image": "URL",
        "footer": "Texto do rodapé"
      }
    }
  }
}
```

### Tratamento de Texto

#### Quebras de Linha
- Use `\n` nos comandos para quebras de linha
- O sistema converte automaticamente `\\n` em quebras reais
- Funciona tanto em mensagens simples quanto embeds

#### Caracteres Especiais
- Aspas são automaticamente escapadas no export
- Emojis funcionam normalmente
- Suporte completo a Unicode

### Permissões Necessárias

#### Bot
- `SEND_MESSAGES` - Enviar mensagens
- `EMBED_LINKS` - Incorporar links (para embeds)
- `VIEW_CHANNEL` - Ver o canal configurado

#### Usuário (para configurar)
- `MANAGE_GUILD` - Gerenciar servidor

### Troubleshooting

#### Problemas Comuns
1. **Bot não responde**
   - Verifique se tem permissões no canal
   - Confirme se está online

2. **Embed não aparece**
   - Verifique permissão `EMBED_LINKS`
   - Teste com `/welcome test`

3. **Placeholders não funcionam**
   - Verifique sintaxe: `{placeholder}`
   - Use `/welcome status` para ver configuração

4. **Comandos não aparecem**
   - Execute `npm run deploy`
   - Aguarde até 1 hora para propagação global

#### Logs e Debug
- Logs detalhados no console do bot
- Use `/welcome test` para validar configuração
- `/welcome status` mostra estado atual

### Changelog

### v1.0 - Sistema Base
- Comandos básicos de configuração
- Suporte a mensagens simples
- Placeholders básicos

### v2.0 - Embeds e Melhorias
- Sistema completo de embeds
- 13 subcomandos especializados
- Tratamento melhorado de texto
- Funcionalidade de export/import
- Status detalhado com dicas
- Documentação completa

### Suporte

Para problemas ou sugestões:
1. Verifique este documento
2. Teste com `/welcome test`
3. Use `/welcome status` para debug
4. Consulte logs do bot
