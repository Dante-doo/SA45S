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

[ Cliente “Trinca” ] ←– HTTPS/WSS –→ [ Servidor Node.js/Express ] ←– MongoDB (chaves públicas + blobs cifrados)

1. **Registro:** cliente gera RSA-2048 → envia chave pública.  
2. **Início de Chat:** emissor gera AES-256 → cifra mensagem → cifra AES com RSA pública do destinatário.  
3. **Entrega:** servidor encaminha pacote cifrado; destinatário usa Identidade para decifrar Envelope e obter Segredo.

## 6. Modelagem de Ameaças e Mitigações  ♦️♦️♦️
| Ameaça         | Mitigação                                                                                  |
|----------------|--------------------------------------------------------------------------------------------|
| MITM           | HTTPS/WSS + E2E Encryption                                                                |
| XSS            | Escapar todo HTML, CSP, sanitização de inputs                                             |
| SQL/NoSQL Inj. | Prepared Statements / ODM seguros, validação estrita                                       |
| CSRF           | Tokens anti-CSRF, cookies `SameSite=Strict`                                               |
| DoS            | Rate limiting, auto-scaling                                                                |
| Roubo de Cookie| Cookies `HttpOnly; Secure`, validação de origem, HMAC de payload                          |

## 7. Tecnologias e Ferramentas  ♠️♠️♠️





