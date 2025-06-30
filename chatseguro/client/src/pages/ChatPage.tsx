import React, { useState, useEffect, useRef } from 'react'
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
} from '@chakra-ui/react'
import { ArrowRightIcon } from '@chakra-ui/icons'

interface Message {
    id: number
    text: string
    fromMe: boolean
}

export default function ChatPage() {
    const [messages, setMessages] = useState<Message[]>([
        { id: 1, text: 'Olá! Como posso ajudar você hoje?', fromMe: false },
        { id: 2, text: 'Quero criar uma conta.', fromMe: true },
        { id: 3, text: 'Claro! Vamos lá.', fromMe: false },
    ])
    const [input, setInput] = useState('')
    const scrollRef = useRef<HTMLDivElement>(null)

    // auto-scroll
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages])

    const handleSend = () => {
        if (!input.trim()) return
        const next: Message = {
            id: messages.length + 1,
            text: input.trim(),
            fromMe: true,
        }
        setMessages((msgs) => [...msgs, next])
        setInput('')
        // aqui você pode chamar a API ou websocket
    }

    return (
        <Flex direction="column" h="100vh" w="100%">
            {/* Header */}
            <Flex align="center" px={4} py={3} borderBottom="1px solid" borderColor="gray.200">
                <Avatar name="Chat Trinca" size="sm" mr={3} />
                <Heading size="sm">Chat Trinca</Heading>
            </Flex>

            {/* Messages area */}
            <Box
                flex="1"
                overflowY="auto"
                px={4}
                py={2}
                bg="gray.50"
                ref={scrollRef}
            >
                <VStack spacing={3} align="stretch">
                    {messages.map((msg) => (
                        <Flex
                            key={msg.id}
                            justify={msg.fromMe ? 'flex-end' : 'flex-start'}
                        >
                            <Box
                                bg={msg.fromMe ? 'red.400' : 'white'}
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

            {/* Input area */}
            <HStack p={3} borderTop="1px solid" borderColor="gray.200">
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
        </Flex>
    )
}
