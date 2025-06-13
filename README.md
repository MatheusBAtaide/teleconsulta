# Hospital Help - Sistema de Teleconsulta

## Pré-requisitos
- Node.js instalado
- MySQL 8.0 instalado e rodando
- NPM ou Yarn instalado

## Configuração do Banco de Dados

1. Crie o banco de dados:
```sql
CREATE DATABASE hospital_help;
```

2. Crie o usuário e conceda as permissões:
```sql
CREATE USER 'hospital_user'@'localhost' IDENTIFIED BY 'senha123';
GRANT ALL PRIVILEGES ON hospital_help.* TO 'hospital_user'@'localhost';
FLUSH PRIVILEGES;
```

## Configuração do Projeto

1. Clone o repositório:
```bash
git clone [URL_DO_REPOSITÓRIO]
cd hospital-help
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:
```
DB_HOST=localhost
DB_USER=hospital_user
DB_PASSWORD=senha123
DB_NAME=hospital_help
```

## Executando o Projeto

### Desenvolvimento
```bash
npm run dev
```

### Produção
```bash
npm run build
npm start
```