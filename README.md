# SA45S - Chat Seguro - ♠️♥️♣️ “Trinca” ♦️♠️♥️




## 1. Introdução e Objetivo  ♣️♣️♣️
Este documento descreve o projeto “Trinca”, um aplicativo de mensagens que garante Confidencialidade, Integridade e Disponibilidade (modelo CIA) por meio de criptografia de ponta a ponta. A proposta combina criptografia simétrica (AES-256) para cifrar o conteúdo das mensagens e criptografia assimétrica (RSA-2048) para troca segura de chaves, de forma que o servidor nunca tenha acesso ao texto claro das conversas.

## 2. Requisitos Funcionais  ♦️♦️♦️
1. **Cadastro e Autenticação**  
   - Usuário registra usuário/senha; senha armazenada com bcrypt.  
   - Login via sessão segura (cookie `HttpOnly; Secure; SameSite=Strict`).  
2. **Gerenciamento de Chaves RSA**  
   - No registro, o cliente gera um par RSA (pública/privada).  
   - Chave pública enviada ao servidor; privada armazenada localmente.  
3. **Troca e Uso de Chave de Sessão AES**  
   - Ao iniciar um chat, o emissor gera uma **Chave de Sessão AES-256** única.  
   - Essa chave é cifrada com a **Chave Pública RSA** do destinatário.  
4. **Envio/Recebimento de Mensagens**  
   - Mensagens cifradas com AES + HMAC-SHA256.  
   - Destinatário decifra o HMAC, decifra a chave AES com sua **Chave Privada RSA** e, em seguida, recupera o texto.

## 3. Nome do Chat e “Trinca” de Chaves  ♠️♠️♠️
O aplicativo chama-se **Trinca** em homenagem às três chaves que garantem sua segurança:

| Rótulo          | Chave                       | Função                                                                                   |
|-----------------|-----------------------------|------------------------------------------------------------------------------------------|
| ✉️ Envelope    | **Chave Pública RSA**       |  Permite a qualquer remetente cifrar a chave AES de sessão destinada ao usuário.         |
| 🆔 Identidade  | **Chave Privada RSA**       |  Usada pelo usuário para decifrar a chave AES que lhe foi enviada.                       |
| 🤫 Segredo     | **Chave de Sessão AES-256** |  Cifra o conteúdo da mensagem de forma eficiente e única para cada troca.                |

Em cada conversa, a “Trinca” funciona assim:  
1. **Envelope** (Chave Pública) sela o **Segredo** (AES).  
2. Apenas quem possui a **Identidade** (Chave Privada) pode abrir o Envelope e revelar o Segredo.  
3. Com o Segredo em mãos, o usuário descriptografa a mensagem.

## 4. Requisitos Não-Funcionais de Segurança  ♥️♥️♥️
- **Confidencialidade:** E2E impede que o servidor veja o texto claro; AES-256 + RSA-2048 resistem a ataques de criptoanálise.  
- **Integridade:** HMAC-SHA256 em cada mensagem garante que nenhuma modificação passe despercebida.  
- **Disponibilidade:** Servidor dimensionado, balanceado e com backups regulares; rate limiting para mitigar DDoS.  
- **Hardening:** Uso de Helmet (CSP, X-Frame-Options), validação e sanitização de entradas, prevenção de XSS/CSRF.

## 5. Arquitetura e Fluxo de Dados  ♣️♣️♣️

[ Cliente “Trinca” ] ←– HTTPS/WSS –→ [ Servidor Node.js/Express ] ←– PostgreSQL (chaves públicas + blobs cifrados)

1. **Registro:** cliente gera RSA-2048 → envia chave pública.  
2. **Início de Chat:** emissor gera AES-256 → cifra mensagem → cifra AES com RSA pública do destinatário.  
3. **Entrega:** servidor encaminha pacote cifrado; destinatário usa Identidade para decifrar Envelope e obter Segredo.

## 6. Tecnologias e Ferramentas  ♠️♠️♠️

O projeto **Trinca** utiliza um conjunto de tecnologias modernas que garantem segurança, desempenho e fácil integração entre as camadas da aplicação. A seguir, listamos as principais tecnologias e ferramentas adotadas:

| Camada       | Tecnologia/Ferramenta                                | Justificativa |
|--------------|-------------------------------------------------------|----------------|
| **Frontend** | **React**                                             | Biblioteca eficiente para construção de interfaces modernas e reativas. |
|              | **Chakra UI**                                         | Framework de componentes acessíveis e estilizados, acelera o desenvolvimento visual. |
|              | **Vite**                                              | Empacotador rápido para React com ótima performance em desenvolvimento. |
| **Backend**  | **Java 17**                                           | Linguagem robusta e amplamente utilizada em aplicações seguras e escaláveis. |
|              | **Spring Boot**                                       | Framework completo que facilita a criação de APIs REST e WebSocket com segurança embutida. |
|              | **Spring Security**                                   | Módulo de segurança que permite autenticação, criptografia de senhas e proteção contra CSRF/XSS. |
|              | **Spring WebSocket**                                  | Suporte à comunicação em tempo real entre usuários (chat). |
| **Banco de Dados** | **PostgreSQL**                                 | Banco de dados relacional confiável, gratuito, com forte suporte a segurança e integridade dos dados. |
|              | **Spring Data JPA**                                   | Abstração de acesso a dados, facilitando a comunicação com o PostgreSQL. |
| **Criptografia** | **Java Cryptography Architecture (JCA)**         | API padrão do Java para operações de criptografia (AES, RSA, HMAC). |
|              | **Bouncy Castle**                                     | Biblioteca de suporte adicional para algoritmos modernos e seguros. |
| **Testes**   | **JUnit 5**                                           | Framework de testes para Java. |
|              | **Mockito**                                           | Simulação de dependências e comportamentos no backend. |
| **Deploy**   | **Render / Railway (Backend)**                        | Plataformas gratuitas que suportam aplicações Java com PostgreSQL. |
|              | **Vercel (Frontend)**                                 | Hospedagem gratuita e rápida para aplicações React. |
|              | **ElephantSQL / Neon (PostgreSQL)**                  | Serviços de banco de dados PostgreSQL em nuvem com planos gratuitos. |

Todas as ferramentas escolhidas são de **uso gratuito** em seus planos básicos, o que torna o projeto acessível para desenvolvimento acadêmico sem custos.

## 📅 Planejamento de Desenvolvimento – Projeto Trinca (Java/Spring Boot + PostgreSQL)

### 🗓️ Fase 1 – Preparação (13 a 19 de maio)
- Definição da arquitetura: cliente-servidor com E2EE
- Escolha das tecnologias:
  - Frontend: React + Chakra UI
  - Backend: Java 17 + Spring Boot
  - Banco de Dados: PostgreSQL
- Escrita da introdução, requisitos e objetivos
- Criação do repositório e estrutura inicial dos projetos

### 🗓️ Fase 2 – Protótipo Funcional (20 de maio a 30 de junho)
- Implementação do backend com Spring Boot:
  - Registro de usuário com senha criptografada (BCrypt)
  - Armazenamento da chave pública RSA no banco
  - Login com autenticação via Spring Security
- Criação do frontend com React:
  - Geração de chave RSA no navegador
  - Interface básica de login, registro e chat
- Implementação da criptografia ponta a ponta:
  - Geração de chave AES por mensagem
  - Criptografia AES da mensagem
  - Criptografia RSA da chave AES
- Comunicação via REST e WebSocket com Spring WebSocket
- Testes manuais com dois usuários
- Implementação de segurança adicional:
  - Proteção contra CSRF, XSS e DoS
  - Cookies HttpOnly + SameSite + HTTPS
- Validações e tratamento de erros
- Testes automatizados com JUnit 5 e Mockito
- Escrita da documentação técnica

### 🗓️ Fase 3 – Entrega Final (1 a 4 de julho)
- Revisão final de código, testes e segurança
- Preparação dos slides e da apresentação
- Demonstração prática do envio e recebimento de mensagens seguras
- Entrega do repositório completo com documentação e link do projeto online







