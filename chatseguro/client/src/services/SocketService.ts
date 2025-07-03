// src/services/socketService.ts
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

// As suas interfaces MessagePayload e SendMessageDto permanecem as mesmas
interface MessagePayload {
    id: string;
    sender: { id: string; username: string };
    receiver: { id: string; username: string };
    encryptedAesKey: string;
    encryptedMessage: string;
    iv: string;
    hmac: string;
    timestamp: string;
}

interface SendMessageDto {
    receiver: string;
    encryptedAesKey: string;
    encryptedMessage: string;
    iv: string;
}

class SocketService {
    private client: Client | null = null;

    public connect(onConnectCallback: () => void, onErrorCallback: (err: any) => void): void {
    const token = localStorage.getItem('authToken');
    if (!token) {
        onErrorCallback(new Error("Usuário não autenticado."));
        return;
    }

    if (this.client && this.client.active) {
        console.warn("Conexão STOMP já está ativa.");
        return;
    }

    // --- MUDANÇA CRUCIAL AQUI ---
    // Anexe o token como um parâmetro de query na URL.
    const socketUrl = `http://${window.location.hostname}:8080/ws?token=${token}`;

    this.client = new Client({
        // Use a nova URL que contém o token.
        webSocketFactory: () => new SockJS(socketUrl),

        // Não precisamos mais de cabeçalhos de conexão.
        // connectHeaders: { ... },

        onConnect: onConnectCallback,
        onStompError: (frame) => {
            console.error('Erro no broker STOMP:', frame.headers['message']);
            console.error('Detalhes:', frame.body);
            onErrorCallback(frame);
        },
        reconnectDelay: 5000,
    });

    this.client.activate();
}

    public disconnect(): void {
        this.client?.deactivate();
        this.client = null;
        console.log("Cliente STOMP desativado e desconectado.");
    }

    public subscribeToTopic(destination: string, onMessageReceived: (message: MessagePayload) => void) {
        if (!this.client?.active) {
            console.error("Cliente STOMP não ativo. Não é possível se inscrever.");
            return;
        }
        return this.client.subscribe(destination, (message: IMessage) => {
            onMessageReceived(JSON.parse(message.body));
        });
    }

    public sendMessage(payload: SendMessageDto): void {
        if (!this.client?.active) {
            console.error("Cliente STOMP não ativo. Não é possível enviar mensagem.");
            return;
        }
        this.client.publish({
            destination: '/app/chat.sendMessage',
            body: JSON.stringify(payload),
        });
    }
}

const socketService = new SocketService();
export default socketService;