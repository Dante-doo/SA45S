import axios from 'axios';

export interface MessageDto {
    id: string;
    senderUsername: string;
    receiverUsername: string;
    encryptedAesKey: string;
    encryptedMessage: string;
    hmac: string;
    timestamp: string;
}

export function fetchInbox(): Promise<MessageDto[]> {
    return axios
        .get<MessageDto[]>('/api/chat/inbox')
        .then(res => res.data);
}

export function fetchSent(): Promise<MessageDto[]> {
    return axios
        .get<MessageDto[]>('/api/chat/sent')
        .then(res => res.data);
}

export function sendMessage(payload: {
    receiver: string;
    encryptedAesKey: string;
    encryptedMessage: string;
    hmac: string;
}): Promise<void> {
    return axios
        .post<void>('/api/chat/send', payload)
        .then(() => {});
}
