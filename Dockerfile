# --- Estágio 1: Construção (Build) ---
# Usa uma imagem oficial do Node.js para construir o projeto
FROM node:18-alpine AS builder

# Define o diretório de trabalho dentro do container
WORKDIR /app

# Copia APENAS o package.json para aproveitar o cache do Docker
COPY package.json ./

# CORREÇÃO FINAL: Usa 'npm install' sem um package-lock.json.
# Isso força a criação de uma árvore de dependências nova e compatível com o ambiente Linux (Alpine) do container.
RUN npm install

# Copia o resto do código-fonte do projeto
COPY . .

# Executa o script de build para gerar os arquivos estáticos na pasta /dist
RUN npm run build

# --- Estágio 2: Produção ---
# Usa uma imagem super leve do Nginx para servir os arquivos
FROM nginx:stable-alpine

# Copia os arquivos estáticos construídos no estágio anterior para a pasta padrão do Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Copia o nosso arquivo de configuração customizado do Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expõe a porta 80, que é a porta padrão do Nginx
EXPOSE 80

# Comando para iniciar o servidor Nginx quando o container for executado
CMD ["nginx", "-g", "daemon off;"]
