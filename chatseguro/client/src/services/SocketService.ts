import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

interface MessagePayload {
    id: string;
    sender: { id: string, username: string };
    receiver: { id: string, username: string };
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
    hmac: string;
}

// --- Implementação do Serviço ---

class SocketService {
    private stompClient: Client | null = null;

    public connect(onConnectCallback: () => void, onErrorCallback: (err: any) => void): void {
        const token = localStorage.getItem('authToken');
        if (!token) {
            console.error("Token de autenticação não encontrado.");
            onErrorCallback(new Error("Usuário não autenticado."));
            return;
        }

        if (this.stompClient?.active) {
            console.warn('Já existe uma conexão STOMP ativa.');
            return;
        }

        this.stompClient = new Client({
            webSocketFactory: () => new SockJS('http://192.168.0.143:8080/ws'),

            connectHeaders: {
                Authorization: `Bearer ${token}`,
            },

            onConnect: () => {
                console.log('Conectado ao servidor WebSocket via STOMP!');
                onConnectCallback();
            },

            onStompError: (frame) => {
                console.error('Erro no broker STOMP:', frame.headers['message']);
                console.error('Detalhes:', frame.body);
                onErrorCallback(frame);
            },
            
            reconnectDelay: 5000,
        });

        this.stompClient.activate();
    }

    public disconnect(): void {
        this.stompClient?.deactivate();
        console.log('Desconectado do servidor WebSocket.');
    }

    public subscribeToTopic(destination: string, onMessageReceived: (message: MessagePayload) => void) {
        if (!this.stompClient?.active) {
            console.error("Não é possível se inscrever, cliente STOMP não está ativo.");
            return;
        }

        return this.stompClient.subscribe(destination, (message: IMessage) => {
            const parsedMessage: MessagePayload = JSON.parse(message.body);
            onMessageReceived(parsedMessage);
        });
    }

    public sendMessage(payload: SendMessageDto): void {
        if (!this.stompClient?.active) {
            console.error("Não é possível enviar mensagem, cliente STOMP não está ativo.");
            return;
        }

        this.stompClient.publish({
            destination: '/app/chat.sendMessage',
            body: JSON.stringify(payload),
        });
    }
}

const socketService = new SocketService();
export default socketService;