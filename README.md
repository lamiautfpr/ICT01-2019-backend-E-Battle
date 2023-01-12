<h1 align="center">
  <br>
  <a href="https://www.lamia.sh.utfpr.edu.br/">
    <img src="https://user-images.githubusercontent.com/26206052/86039037-3dfa0b80-ba18-11ea-9ab3-7e0696b505af.png" alt="LAMIA - Laboratório de                  Aprendizagem de Máquina e Imagens Aplicados à Indústria" width="400"></a>
<br> <br>
API E-Battle


</h1>
<p align="center">
  <a href="https://www.lamia.sh.utfpr.edu.br/">
    <img src="https://img.shields.io/badge/Follow-Lab%20Page-blue" alt="Lab">
  </a> 
</p>

<p align="center">
<b>Equipe:</b>  
<br>
Thiago Naves <a href="https://github.com/tfnaves" target="_blank"> (Naves, T. F.)</a> - Coordenador   <br>
Guilherme Veras Castagnaro Correia <a href="https://github.com/guilhermeV20" target="_blank">(Correia, G. V. C.)</a> - Membro Líder<br>
Erik Henrique dos Santos Nascimento <a href="https://github.com/ErikHenrique09" target="_blank">(Nascimento, E. H. S.)</a> - Membro <br>
Henrique da Luz Pacheco <a href="https://github.com/henriquepacheco26" target="_blank">(Pacheco, H. L.)</a> - Membro
</p>

<p align="center">  
<b>Grupo</b>: <a href="https://www.lamia.sh.utfpr.edu.br/" target="_blank">LAMIA - Laboratório de Aprendizado de Máquina e Imagens Aplicados à Indústria </a> <br>
<b>Email</b>: <a href="mailto:lamia-sh@utfpr.edu.br" target="_blank">lamia-sh@utfpr.edu.br</a> <br>
<b>Organização</b>: <a href="http://portal.utfpr.edu.br" target="_blank">Universidade Tecnológica Federal do Paraná</a> <a href="http://www.utfpr.edu.br/campus/santahelena" target="_blank"> - Campus Santa Helena</a> <br>
</p>

<p align="center">
<br>
Status do Projeto: Em desenvolvimento :warning:
</p>

# Resumo
O projeto consiste em desenvolver um jogo digital com base em uma dinâmica de tabuleiro para uso em sala de aula para testar conhecimentos dos alunos de forma individual ou em grupo. O projeto possui os diferenciais de utilizar recursos de efeitos visuais da engine Unity e não utilizar conteúdos de aprendizado estáticos, sendo possível o professor customizar os conteúdos de conhecimento que são utilizados no jogo.

## Objetivo
O objetivo principal do projeto E-Battle é o de estimular o aprendizado em sala de aula através da competitividade saudável entre os jogadores. O grande diferencial do projeto está justamente na total personalização do conteúdo das perguntas realizadas durante a partida, que ficará a cargo do aplicador/professor.


## Como Contribuir com o Projeto

1. Selecione um [issue](https://github.com/lamiautfpr/ICT01-2019-backend-E-Battle/issues) aberto que ainda não tenha ninguém designado, de preferência com a tag `important`;  
2. Coloque voce como um *Assignee* e crie um *branch* a partir do *issue* com a *branch* `qa` como origem;  
3. Clone o repositorio em sua máquina (rode o comando `npm i` para instalar as dependencias) ou faça o *fetch* da origem caso já tenha o repositorio em sua máquina;
4. Faça o *checkout* da nova *branch*;
5. Faça as alterações necessárias;
6. Rode o comando `npm run lint:fix` para formatar o código;
7. Faça o *commit* das alterações seguindo o seguinte padrão para a mensagem:  
   `type(route) Resumo do que foi feito [#issue]`
   Onde type pode ser um dos seguintes:
   - `feat`: para novas funcionalidades;
   - `fix`: para correções de bugs;
   - `doc`: para alterações na documentação;
   - `style`: para alterações que não afetam o código (espaços em branco, formatação, etc);
   - `imp`: para melhorias e refatorações de código;
   - `test`: para adição ou alteração de testes;
   - `chore`: para alterações em tarefas de build ou configuração;
   - `oth`: para outras tarefas que não incluem as anteriores (NÃO utilize esse sem a permissão de um membro líder)
8. Faça o *push* dos novos *commits* para o repositório;
9. Abra um *pull request* para a *branch* `qa` com o nome `$issue - título do isssue` e adicione na descrição informas adicionas caso necessário;
10. Espere os testes rodarem, caso algum deles falhe, corrija o problema e faça push das alterações;
11. Marque um membro líder e um membro comum para revisar o *pull request*;
12. Caso o *pull request* seja rejeitado, corrija os problemas e volte para o passo 9;
13. Caso o *pull request* seja aceito, o membro líder irá fazer o *merge* da *branch* `qa` para a *branch* `master` e fechar o *issue*.;
14. Faça o *checkout* para *branch* `qa` e faça o *pull* da origem para evitar subir a branch novamente.


## Tecnologias

API do E-Battle usa as seguintes tecnologias:

* [NestJS](https://nestjs.com/) - game engine utilizada no desenvolvimento
* [PostgreSQL](https://www.postgresql.org/) - banco de dados utilizado atualmente no desenvolvimento
* [Amazon AWS](https://aws.amazon.com/) - plataforma de serviços de computação em nuvem utilizada para hospedar os serviços

## Citação

Se você utliza e quer citar o projeto em sua pesquisa, por favor utilize o formato de citação abaixo:

    @inproceedings{LAMIA_ict01,
      title={E-Battle},
      author={Naves, T. F.; Correia, G. V. C.; Nascimento, E. H. S.; Pacheco, H. L.)},
      journal={IEEE Conference on Big Data},
      year={2021}
    }