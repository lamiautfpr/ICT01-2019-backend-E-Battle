# ICT01-2019-backend-E-Battle

## Resumo
O projeto visa construir o Backend para integração de uma plataforma web com o projeto ICT01-2019 E-Battle que, por sua vez, é um jogo educacional que tem como objetivo estimular o aprendizado em sala de aula por meio da competição saudável entre os jogadores. <br/>

------------------
### Como Utilizar 

Primeiramente, instale as dependências do projeto. Digite no terminal: <br/>
```yarn install```

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
```yarn run format```<br/>
```yarn run lint```<br/>
Com o intuito de corrigir possíveis erros de formatação que o lint encontrar. 
<br/>

4. Após a correção, verifique mais uma vez se está nos padrões: <br/>
```yarn run format``` <br/>
```yarn run lint``` <br/>
e repita esse processo enquanto existirem erros de formatação.

5. Se não houver mais nenhum erro, finalize o processo realizando o commit das suas alterações:<br/>
    * Commite os códigos <br/>
    * Faça upload para o github <br/>
    * Faça o pull request da sua branch para a branch de qa <br/>
    * Adicione alguém como reviwer.