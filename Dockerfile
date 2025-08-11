# Usando a imagem Node.js como base
FROM node:22-alpine

# Definir o diretório de trabalho no container
WORKDIR /app

# Copiar arquivos de dependências
COPY package.json package-lock.json ./

# Instalar dependências
RUN npm install --only=production

# Copiar o restante dos arquivos do projeto
COPY . .

# Criar diretório para dados persistentes
RUN mkdir -p /app/data

# Definir volume para dados persistentes
VOLUME ["/app/data"]

# Definir variável de ambiente para o diretório de dados
ENV DATA_DIR=/app/data

# Expor porta se necessário (para futuras funcionalidades web)
# EXPOSE 3000

# Comando para rodar o bot
CMD ["node", "src/bot.js"]
