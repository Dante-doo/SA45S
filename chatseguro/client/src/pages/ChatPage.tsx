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
    const privateKeyRef = useRef<CryptoKey | null>(null); 
    const [isChatReady, setIsChatReady] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const toast = useToast();

    const effectRan = useRef(false);


    // Efeito para rolar para a última mensagem
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    // Efeito principal para conexão e inscrição
    useEffect(() => {
        // Se já rodamos o efeito, não faça nada.
        if (effectRan.current === true) {
            return;
        }

        // --- A sua lógica de inicialização permanece a mesma ---
        const initializeUser = async () => {
            try {
                const loggedInUser = prompt("Para fins de teste, digite seu nome de usuário:");
                if (!loggedInUser) {
                    toast({ title: "Usuário não definido.", status: "error" });
                    return null;
                }
                setMyUsername(loggedInUser);

                const privateKeyPem = localStorage.getItem('privateKey');
                if (!privateKeyPem) {
                    toast({ title: "Chave privada não encontrada!", status: "error" });
                    return null;
                }
                privateKeyRef.current = await importPrivateKey(privateKeyPem);
                return loggedInUser;
            } catch (error) {
                console.error("Erro ao inicializar chave:", error);
                toast({ title: "Erro ao carregar sua chave de segurança.", status: "error" });
                return null;
            }
        };

        const onConnect = (username: string) => {
        const topic = `/topic/messages/${username}`;
        console.log(`FRONTEND: Inscrevendo-se no tópico: [${topic}]`);

        socketService.subscribeToTopic(topic, async (message: ReceivedMessage) => {
            console.log("Nova mensagem recebida!", message);

            setIsChatReady(true); // <-- Habilita o chat

            // 1. VERIFICAÇÃO DE SEGURANÇA
            // Garante que a chave privada foi carregada antes de tentar descriptografar.
            if (!privateKeyRef.current) {
                console.error("A chave privada não está carregada para descriptografar.");
                toast({ title: "Erro de segurança: chave não encontrada.", status: "error" });
                return;
            }

            try {
                // 2. DESCRIPTOGRAFIA DA MENSAGEM
                // Chama a função do seu utilitário de criptografia.
                const decryptedText = await decryptFromSender(
                    message.encryptedAesKey,
                    message.iv,
                    message.encryptedMessage,
                    privateKeyRef.current
                );

                // 3. ATUALIZAÇÃO DA INTERFACE (UI)
                // Cria o objeto de mensagem formatado para exibição.
                const newMessage: DisplayMessage = {
                    id: message.id, // Usa o ID real vindo do backend
                    text: decryptedText,
                    fromMe: false, // Mensagens recebidas nunca são "de mim"
                    senderUsername: message.sender.username,
                };

                // Adiciona a nova mensagem ao estado, fazendo com que o React a renderize na tela.
                setMessages((prevMessages) => [...prevMessages, newMessage]);

            } catch (error) {
                // 4. TRATAMENTO DE ERROS
                // Caso a descriptografia falhe (ex: mensagem corrompida ou chave errada).
                console.error("Falha ao descriptografar a mensagem:", error);
                toast({
                    title: "Recebida uma mensagem corrompida.",
                    description: "Não foi possível exibir a última mensagem recebida.",
                    status: 'warning',
                    duration: 5000,
                    isClosable: true
                });
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

        initializeUser().then(loggedInUser => {
            if (loggedInUser) {
                socketService.connect(() => onConnect(loggedInUser), onError);
            }
        });

        // A função de limpeza agora só precisa desconectar
        return () => {
            // Marca que o efeito rodou para que não rode novamente na segunda montagem
            effectRan.current = true;
            socketService.disconnect();
        };

    // O array vazio ainda é correto, para que o React só considere este efeito na montagem/desmontagem
    }, []); // O array de dependências vazio garante que isso rode apenas uma vez

    // Dentro do seu componente ChatPage

const handleSend = async () => {
    if (!input.trim() || !myUsername) return;

    // --- MUDANÇA IMPORTANTE AQUI ---
    // Pergunta para quem é a mensagem, em vez de usar um nome fixo.
    const recipientUsername = prompt("Para quem você quer enviar a mensagem?");
    if (!recipientUsername) {
        toast({ title: "Destinatário não informado.", status: "warning" });
        return;
    }

    try {
        const resp = await axios.get<{ publicKey: string }>(`/api/auth/public-key/${recipientUsername}`);
        const recipientPem = resp.data.publicKey;

        const { encryptedAesKey, iv, ciphertext } = await encryptForRecipient(input.trim(), recipientPem);
        
        socketService.sendMessage({
            receiver: recipientUsername,
            encryptedAesKey,
            encryptedMessage: ciphertext,
            iv,
        });

        const next: DisplayMessage = {
            id: crypto.randomUUID(),
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
             description: err.response?.data?.message || 'Não foi possível encontrar o destinatário.',
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
                        <Input placeholder="Digite sua mensagem..." value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} bg="white"/>
                        <IconButton aria-label="Enviar" icon={<ArrowRightIcon />} colorScheme="red" onClick={handleSend}/>
                    </HStack>
                </Box>
            </Container>
        </Box>
    );
}