import React, { useState } from 'react'
import axios from 'axios'
import {
    Box,
    Container,
    Heading,
    FormControl,
    FormLabel,
    Input,
    FormErrorMessage,
    Button,
    Stack,
    Text,
    useToast,
} from '@chakra-ui/react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'

export default function LoginPage() {
    const [name, setName] = useState('')
    const [password, setPassword] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSubmitted, setIsSubmitted] = useState(false)
    const toast = useToast()
    const navigate = useNavigate()

    const isPasswordError = password.length < 6

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitted(true)

        if ( isPasswordError) {
            toast({
                title: 'Corrija os erros no formulário.',
                status: 'error',
                duration: 3000,
                isClosable: true,
            })
            return
        }

        setIsSubmitting(true)
        try {
            const payload = { username: name, password }
            const response = await axios.post('/api/auth/login', payload)
            const { token } = response.data
            localStorage.setItem('authToken', token)

            toast({
                title: 'Login efetuado com sucesso!',
                status: 'success',
                duration: 2000,
                isClosable: true,
            })
            navigate('/chat')
        } catch (err: any) {
            console.error(err)
            toast({
                title: 'Erro ao efetuar login.',
                status: 'error',
                description:
                    err.response?.data?.message || 'E-mail ou senha incorretos.',
                duration: 3000,
                isClosable: true,
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            w="100%"
            h="100vh"
            pos="relative"
            bgImage="url('/background.jpg')"
            bgPos="center"
            bgSize="cover"
            bgRepeat="no-repeat"
        >
            <Box
                pos="absolute"
                inset="0"
                bg="blackAlpha.400"
                zIndex={0}
            />

            <Container
                maxW="md"
                bg="white"
                boxShadow="lg"
                borderRadius="lg"
                p={8}
                zIndex={1}
            >
                <Heading mb={6} textAlign="center">
                    Entrar
                </Heading>

                <form onSubmit={handleSubmit}>
                    <Stack spacing={4}>
                        <FormControl isInvalid={isSubmitted}>
                            <FormLabel>Nome</FormLabel>
                            <Input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Seu nome"
                            />
                        </FormControl>

                        <FormControl isInvalid={isSubmitted && isPasswordError}>
                            <FormLabel>Senha</FormLabel>
                            <Input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="mínimo 6 caracteres"
                            />
                            {isSubmitted && isPasswordError && (
                                <FormErrorMessage>
                                    A senha deve ter pelo menos 6 caracteres.
                                </FormErrorMessage>
                            )}
                        </FormControl>

                        <Button
                            type="submit"
                            colorScheme="red"
                            size="lg"
                            isLoading={isSubmitting}
                        >
                            Entrar
                        </Button>
                    </Stack>
                </form>

                <Text mt={4} textAlign="center" color="gray.600">
                    Ainda não tem conta?{' '}
                    <Button
                        as={RouterLink}
                        to="/register"
                        variant="link"
                        colorScheme="red"
                    >
                        Registrar
                    </Button>
                </Text>
            </Container>
        </Box>
    )
}
