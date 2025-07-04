import React from 'react'
import {
    Box,
    Container,
    Heading,
    Text,
    Button,
    Stack,
    VStack,
    useColorModeValue,
} from '@chakra-ui/react'
import { Link as RouterLink } from 'react-router-dom'

export default function HomePage() {
    const textColor = useColorModeValue('whiteAlpha.900', 'blackAlpha.900')

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
            <Box
                pos="absolute"
                inset="0"
                bg="blackAlpha.400"
                zIndex={0}
            />

            <Container
                maxW="container.xl"
                pos="relative"
                zIndex={1}
                py={{ base: 16, md: 32 }}
            >
                <Box
                    bg="blackAlpha.900"
                    borderRadius="lg"
                    p={{ base: 6, md: 12 }}
                    maxW={{ base: '90%', md: '600px' }}
                    mx="auto"
                >
                    <VStack spacing={{ base: 6, md: 10 }} textAlign="center">
                        <Heading
                            fontSize={{ base: '3xl', md: '5xl' }}
                            color="white"
                            fontWeight="extrabold"
                        >
                            Bem-vindo ao Trinca
                        </Heading>
                        <Text
                            fontSize={{ base: 'lg', md: '2xl' }}
                            color="whiteAlpha.900"
                            maxW="3xl"
                        >
                            Converse com total privacidade e estilo. Use nossa plataforma
                            a qualquer hora e em qualquer dispositivo.
                        </Text>

                        <Stack
                            direction={{ base: 'column', sm: 'row' }}
                            spacing={4}
                            pt={4}
                            justify="center"
                        >
                            <Button
                                as={RouterLink}
                                to="/register"
                                size="lg"
                                colorScheme="red"
                            >
                                Registrar
                            </Button>
                            <Button
                                as={RouterLink}
                                to="/login"
                                size="lg"
                                variant="outline"
                                borderColor="white"
                                color="white"
                            >
                                Entrar
                            </Button>
                        </Stack>
                    </VStack>
                </Box>
            </Container>
        </Box>
    )
}
