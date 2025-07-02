// src/pages/ChatPage.tsx
import React, { useState, useEffect, useRef } from 'react'
import axios from 'axios'
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
} from '@chakra-ui/react'
import { ArrowRightIcon } from '@chakra-ui/icons'
import { encryptForRecipient } from '../util/Crypto'

interface Message {
    id: number
    text: string
    fromMe: boolean
}

export default function ChatPage() {
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState('')
    const scrollRef = useRef<HTMLDivElement>(null)
    const toast = useToast()

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages])

    const handleSend = async () => {
        if (!input.trim()) return

        try {
            // busca chave pública do destinatário
            const resp = await axios.get<string>(
                'http://localhost:8080/api/auth/public-key/' + encodeURIComponent('recipientUsername')
            )
            const recipientPem = resp.data // PEM format esperado

            // cifrar antes de enviar
            const { encryptedAesKey, iv, ciphertext, hmac } = await encryptForRecipient(
                input.trim(),
                recipientPem
            )

            // enviar ao servidor
            await axios.post('/api/messages', {
                to: 'recipientUsername',
                encryptedAesKey,
                iv,
                ciphertext,
                hmac,
            })

            // adicionar localmente
            const next: Message = {
                id: messages.length + 1,
                text: input.trim(),
                fromMe: true,
            }
            setMessages((msgs) => [...msgs, next])
            setInput('')
        } catch (err: any) {
            console.error(err)
            toast({
                title: 'Erro ao enviar mensagem.',
                status: 'error',
                description: err.response?.data?.message || 'Tente novamente mais tarde.',
                duration: 3000,
                isClosable: true,
            })
        }
    }

    const bgOverlay = useColorModeValue('whiteAlpha.900', 'blackAlpha.600')

    return (
        <Box
            as="section"
            w="100%"
            h="100vh"
            pos="relative"
            bgImage="url('/background.jpg')"
            bgPos="center"
            bgSize="cover"
            bgRepeat="no-repeat"
        >
            <Box pos="absolute" inset="0" bg="blackAlpha.600" zIndex={0} />

            <Container
                maxW="container.md"
                pos="relative"
                zIndex={1}
                h="100%"
                display="flex"
                flexDirection="column"
                py={{ base: 4, md: 8 }}
            >
                {/* Header */}
                <Flex align="center" mb={4}>
                    <Avatar name="Chat Trinca" size="sm" mr={3} />
                    <Heading size="md" color="white">
                        Chat Trinca
                    </Heading>
                </Flex>

                <Box
                    flex="1"
                    bg={bgOverlay}
                    borderRadius="xl"
                    boxShadow="lg"
                    display="flex"
                    flexDirection="column"
                    overflow="hidden"
                >
                    {/* Mensagens */}
                    <Box
                        flex="1"
                        overflowY="auto"
                        px={4}
                        py={3}
                        ref={scrollRef}
                    >
                        <VStack spacing={3} align="stretch">
                            {messages.map((msg) => (
                                <Flex
                                    key={msg.id}
                                    justify={msg.fromMe ? 'flex-end' : 'flex-start'}
                                >
                                    <Box
                                        bg={msg.fromMe ? 'red.400' : 'gray.100'}
                                        color={msg.fromMe ? 'white' : 'black'}
                                        px={4}
                                        py={2}
                                        borderRadius="lg"
                                        maxW="70%"
                                        boxShadow="sm"
                                    >
                                        <Text fontSize="md">{msg.text}</Text>
                                    </Box>
                                </Flex>
                            ))}
                        </VStack>
                    </Box>

                    {/* Input */}
                    <HStack borderTop="1px solid" borderColor="gray.200" p={3}>
                        <Input
                            placeholder="Digite sua mensagem..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            bg="white"
                        />
                        <IconButton
                            aria-label="Enviar"
                            icon={<ArrowRightIcon />}
                            colorScheme="red"
                            onClick={handleSend}
                        />
                    </HStack>
                </Box>
            </Container>
        </Box>
    )
}
