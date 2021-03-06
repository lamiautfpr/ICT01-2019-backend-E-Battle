# ICT01-2019-backend-E-Battle


## Resumo
O projeto visa construir o Backend para integração de uma plataforma web com o projeto ICT01-2019 E-Battle que, por sua vez, é um jogo educacional que tem como objetivo estimular o aprendizado em sala de aula por meio da competição saudável entre os jogadores. <br/>

------------------
### Como Utilizar 

* Primeiramente, instale as dependências do projeto. <br/>

Precisaremos da versão 16 LTS do NodeJS, disponível no link abaixo: <br/>
<https://nodejs.org/en/> <br/>

Instale também o NestJS, por meio do comando: <br/>
```npm i -g @nestjs/cli``` <br/>

Bem como o TypeORM: <br/>
```npm i -g typeorm```

E por fim, o Yarn: <br/>
```npm i -g yarn```

Não esqueça de clonar o projeto: <br/>
SSH: ```git clone git@github.com:lamiautfpr/ICT01-2019-backend-E-Battle.git``` <br/>
HTTP: ```git clone https://github.com/lamiautfpr/ICT01-2019-backend-E-Battle.git```

E dentro do projeto instale o pacotes necessários
```yarn install```

Copie o arquivo `.env.example` para `.env`
E defina as variáveis de ambiente conforme necessário

---

### Para Desenvolver
* Utilize sempre a branch qa

1. Crie uma nova branch a partir de qa <br/>
```git checkout -b 00-exemplo```

2. Afim de testar o codigo desenvolvido <br/>
Digite no terminal: <br/>
```yarn run start:dev```
<br/> Em seguida, no seu navegador, entre no swagger:
<http://localhost:3000/api/#/>


3. Ao finalizar o desenvolvimento, digite no terminal: <br/>
```yarn run lint```<br/>
Com o intuito de corrigir possíveis erros de formatação que o lint encontrar. 
<br/>

4. Após a correção, verifique mais uma vez se está nos padrões: <br/>
```yarn run lint``` <br/>
e repita esse processo enquanto existirem erros.

5. Se não houver mais nenhum erro, finalize o processo realizando o commit das suas alterações:<br/>
    * Commite os códigos <br/>
    * Faça upload para o github <br/>
    * Faça o pull request da sua branch para a branch de qa <br/>
    * Adicione alguém como reviwer.
