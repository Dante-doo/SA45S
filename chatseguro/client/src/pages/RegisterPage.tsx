// src/pages/RegisterPage.tsx
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

export default function RegisterPage() {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSubmitted, setIsSubmitted] = useState(false)
    const toast = useToast()
    const navigate = useNavigate()

    // Validações
    const isNameError = name.trim() === ''
    const isEmailError = !/\S+@\S+\.\S+/.test(email)
    const isPasswordError = password.length < 6
    const isConfirmError = password !== confirmPassword

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitted(true)

        // Se tiver qualquer erro, não prossegue
        if (isNameError || isEmailError || isPasswordError || isConfirmError) {
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
            const payload = { name, email, password }
            await axios.post('/api/auth/register', payload)

            toast({
                title: 'Conta criada com sucesso!',
                status: 'success',
                duration: 3000,
                isClosable: true,
            })
            navigate('/login')
        } catch (err: any) {
            console.error(err)
            toast({
                title: 'Erro ao criar conta.',
                status: 'error',
                description:
                    err.response?.data?.message ||
                    'Tente novamente mais tarde.',
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
                    Registrar
                </Heading>

                <form onSubmit={handleSubmit}>
                    <Stack spacing={4}>
                        <FormControl isInvalid={isSubmitted && isNameError}>
                            <FormLabel>Nome completo</FormLabel>
                            <Input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Seu nome"
                            />
                            {isSubmitted && isNameError && (
                                <FormErrorMessage>
                                    Nome é obrigatório.
                                </FormErrorMessage>
                            )}
                        </FormControl>

                        <FormControl isInvalid={isSubmitted && isEmailError}>
                            <FormLabel>E-mail</FormLabel>
                            <Input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="seu@email.com"
                            />
                            {isSubmitted && isEmailError && (
                                <FormErrorMessage>
                                    E-mail inválido.
                                </FormErrorMessage>
                            )}
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

                        <FormControl isInvalid={isSubmitted && isConfirmError}>
                            <FormLabel>Confirmar senha</FormLabel>
                            <Input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) =>
                                    setConfirmPassword(e.target.value)
                                }
                                placeholder="digite novamente"
                            />
                            {isSubmitted && isConfirmError && (
                                <FormErrorMessage>
                                    As senhas não coincidem.
                                </FormErrorMessage>
                            )}
                        </FormControl>

                        <Button
                            type="submit"
                            colorScheme="red"
                            size="lg"
                            isLoading={isSubmitting}
                        >
                            Criar conta
                        </Button>
                    </Stack>
                </form>

                <Text mt={4} textAlign="center" color="gray.600">
                    Já tem uma conta?{' '}
                    <Button
                        as={RouterLink}
                        to="/login"
                        variant="link"
                        colorScheme="red"
                    >
                        Entrar
                    </Button>
                </Text>
            </Container>
        </Box>
    )
}
