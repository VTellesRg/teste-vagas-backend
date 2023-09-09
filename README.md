# TESTE VAGA SHOPPER REACT NODE FULL STACK JR

## Instruções para rodar inicializar o back-end

- Neste repositório se encontra os arquivos de back end em node do desafio proposto pela Shopper, siga as instruções abaixo para inicializar a api:
1. Clone o repositório em sua máquina local
2. Abra o terminal na pasta do projeto e execute o comando `npm install nodemon -g` para instalar o nodemon globalmente 
3. Execute o comando `npm install` para instalar as dependências do projeto
4. Execute o comando `npm run dev` para inicializar o servidor
5. para acessar a api utilize o endereço `http://localhost:3333/` na plataforma de sua preferência, agora basta acessar `http://localhost:3000/` para enviar um arquivo e testar o funcionamento da api!

## Breve descrição do projeto
- O projeto consiste em uma api que recebe uma planilha de atualização de preços de produtos, a api lê o arquivo e realiza as validações solicitadas pela Shopper, após a validação a api retorna para a tabela de front-end as informações necessárias para atualizar os preços dos produtos, caso todas as validações sejam atendidas a api permite a atualização dos preços no banco de dados, caso contrário a api retorna as mensagens de erro para o front-end e o usuário precisa reenviar o arquivo com os dados corrigidos de acordo com os parametros do desafio.
