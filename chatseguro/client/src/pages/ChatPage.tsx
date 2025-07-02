// src/pages/ChatPage.tsx
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
    Box,
    Flex,
    HStack,
    VStack,
    Input,
    IconButton,
    Text,
    Avatar,
    Heading,
    Container,
    useColorModeValue,
    useToast,
} from '@chakra-ui/react';
import { ArrowRightIcon } from '@chakra-ui/icons';
// Importe as duas funções de criptografia necessárias
import { encryptForRecipient, decryptFromSender, importPrivateKey } from '../util/Crypto'; 
import socketService from '../services/SocketService';

// Interface de mensagem que o backend envia (payload do WebSocket)
interface ReceivedMessage {
    id: string; // UUID do backend
    sender: { username: string };
    encryptedAesKey: string;
    encryptedMessage: string; // No seu Crypto.ts, isso é o 'ciphertext'
    iv: string;
    hmac: string;
}

// Interface para a mensagem exibida na UI
interface DisplayMessage {
    id: string;
    text: string;
    fromMe: boolean;
    senderUsername: string;
}

export default function ChatPage() {
    const [messages, setMessages] = useState<DisplayMessage[]>([]);
    const [input, setInput] = useState('');
    const [myUsername, setMyUsername] = useState<string>('');
    const privateKeyRef = useRef<CryptoKey | null>(null); // Ref para guardar a chave privada importada
    const scrollRef = useRef<HTMLDivElement>(null);
    const toast = useToast();

    // Efeito para rolar para a última mensagem
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    // Efeito principal para conexão e inscrição
    useEffect(() => {
        // --- 1. CARREGAR DADOS DO USUÁRIO E CHAVE PRIVADA ---
        const initializeUser = async () => {
            try {
                // Carrega o nome do usuário (ex: do token ou de um endpoint /me)
                // Por enquanto, vamos pegar de um prompt, mas o ideal é decodificar do JWT ou de um contexto de usuário
                const loggedInUser = prompt("Para fins de teste, digite seu nome de usuário:");
                if (!loggedInUser) {
                    toast({ title: "Usuário não definido.", status: "error" });
                    return;
                }
                setMyUsername(loggedInUser);

                // Carrega a chave privada em formato PEM do localStorage
                const privateKeyPem = localStorage.getItem('privateKey');
                if (!privateKeyPem) {
                    toast({ title: "Chave privada não encontrada!", status: "error" });
                    return;
                }
                // Importa a chave e a armazena na ref para uso futuro
                privateKeyRef.current = await importPrivateKey(privateKeyPem);
                
                return loggedInUser; // Retorna o nome de usuário para o próximo passo
            } catch (error) {
                console.error("Erro ao inicializar chave:", error);
                toast({ title: "Erro ao carregar sua chave de segurança.", status: "error" });
                return null;
            }
        };

        const onConnect = (username: string) => {
             // --- 3. INSCREVER-SE NO TÓPICO PESSOAL ---
            socketService.subscribeToTopic(`/topic/messages/${username}`, async (message: ReceivedMessage) => {
                console.log("Nova mensagem recebida!", message);

                if (!privateKeyRef.current) {
                    console.error("A chave privada não está carregada para descriptografar.");
                    return;
                }

                try {
                    // --- 4. DESCRIPTOGRAFIA ---
                    const decryptedText = await decryptFromSender(
                        message.encryptedAesKey,
                        message.iv,
                        message.encryptedMessage, // Lembre-se que isto é o 'ciphertext'
                        message.hmac,
                        privateKeyRef.current
                    );

                    // --- 5. ATUALIZAR A UI ---
                    const newMessage: DisplayMessage = {
                        id: message.id,
                        text: decryptedText,
                        fromMe: false, // Mensagens recebidas nunca são "de mim"
                        senderUsername: message.sender.username,
                    };

                    setMessages((prevMessages) => [...prevMessages, newMessage]);

                } catch (error) {
                    console.error("Falha ao descriptografar a mensagem:", error);
                    toast({ title: "Recebida uma mensagem corrompida.", status: 'warning' });
                }
            });
        };

        const onError = (err: any) => {
            toast({
                title: 'Erro na conexão com o chat.',
                description: 'Não foi possível conectar ao servidor de mensagens.',
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        };
        
        // --- 2. INICIAR CONEXÃO ---
        initializeUser().then(loggedInUser => {
            if (loggedInUser) {
                // Passa a função de callback que será executada na conexão
                socketService.connect(() => onConnect(loggedInUser), onError);
            }
        });

        // Função de limpeza para desconectar quando o componente for desmontado
        return () => {
            socketService.disconnect();
        };
    }, [toast]); // O array de dependências vazio garante que isso rode apenas uma vez

    const handleSend = async () => {
        // (A sua função handleSend permanece a mesma que corrigimos anteriormente)
        if (!input.trim() || !myUsername) return;
        const recipientUsername = "recipientUsername"; // TODO: Tornar dinâmico

        try {
            const resp = await axios.get<{ publicKey: string }>(`/api/auth/public-key/${recipientUsername}`);
            const recipientPem = resp.data.publicKey;

            const { encryptedAesKey, iv, ciphertext, hmac } = await encryptForRecipient(input.trim(), recipientPem);
            
            socketService.sendMessage({
                receiver: recipientUsername,
                encryptedAesKey,
                encryptedMessage: ciphertext,
                iv,
                hmac,
            });

            const next: DisplayMessage = {
                id: crypto.randomUUID(), // Gera um ID temporário para a UI
                text: input.trim(),
                fromMe: true,
                senderUsername: myUsername,
            };
            setMessages((msgs) => [...msgs, next]);
            setInput('');
        } catch (err: any) {
             console.error(err);
             toast({
                 title: 'Erro ao enviar mensagem.',
                 status: 'error',
                 description: err.response?.data?.message || 'Tente novamente mais tarde.',
                 duration: 3000,
                 isClosable: true,
             });
        }
    };

    const bgOverlay = useColorModeValue('whiteAlpha.900', 'blackAlpha.600');

    return (
        // O seu JSX permanece o mesmo
        <Box as="section" w="100%" h="100vh" pos="relative" bgImage="url('/background.jpg')" bgPos="center" bgSize="cover" bgRepeat="no-repeat">
            <Box pos="absolute" inset="0" bg="blackAlpha.600" zIndex={0} />

            <Container maxW="container.md" pos="relative" zIndex={1} h="100%" display="flex" flexDirection="column" py={{ base: 4, md: 8 }}>
                {/* Header */}
                <Flex align="center" mb={4}>
                    <Avatar name="Chat Trinca" size="sm" mr={3} />
                    <Heading size="md" color="white">
                        Chat com { "recipientUsername" /* TODO: Tornar dinâmico */ }
                    </Heading>
                </Flex>

                <Box flex="1" bg={bgOverlay} borderRadius="xl" boxShadow="lg" display="flex" flexDirection="column" overflow="hidden">
                    {/* Mensagens */}
                    <Box flex="1" overflowY="auto" px={4} py={3} ref={scrollRef}>
                        <VStack spacing={3} align="stretch">
                            {messages.map((msg) => (
                                <Flex key={msg.id} justify={msg.fromMe ? 'flex-end' : 'flex-start'}>
                                    <Box bg={msg.fromMe ? 'red.400' : 'gray.100'} color={msg.fromMe ? 'white' : 'black'} px={4} py={2} borderRadius="lg" maxW="70%" boxShadow="sm">
                                        {!msg.fromMe && (
                                            <Text fontSize="xs" fontWeight="bold" mb={1}>{msg.senderUsername}</Text>
                                        )}
                                        <Text fontSize="md">{msg.text}</Text>
                                    </Box>
                                </Flex>
                            ))}
                        </VStack>
                    </Box>

                    {/* Input */}
                    <HStack borderTop="1px solid" borderColor="gray.200" p={3}>
                        <Input placeholder="Digite sua mensagem..." value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} bg="white" />
                        <IconButton aria-label="Enviar" icon={<ArrowRightIcon />} colorScheme="red" onClick={handleSend} />
                    </HStack>
                </Box>
            </Container>
        </Box>
    );
}