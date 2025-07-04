import React, { useState } from "react";
import axios from "axios";
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
} from "@chakra-ui/react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { arrayBufferToBase64 } from "../util/Crypto";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  const isNameError = name.trim() === "";
  const isEmailError = !/\S+@\S+\.\S+/.test(email);
  const isPasswordError = password.length < 6;
  const isConfirmError = password !== confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);

    if (isNameError || isEmailError || isPasswordError || isConfirmError) {
      toast({
        title: "Corrija os erros no formulário.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const keyPair = await window.crypto.subtle.generateKey(
        {
          name: "RSA-OAEP",
          modulusLength: 2048,
          publicExponent: new Uint8Array([1, 0, 1]),
          hash: "SHA-256",
        },
        true,
        ["encrypt", "decrypt"]
      );

      const spki = await window.crypto.subtle.exportKey(
        "spki",
        keyPair.publicKey
      );
      const publicKeyBase64 = arrayBufferToBase64(spki);

      const pkcs8 = await window.crypto.subtle.exportKey(
        "pkcs8",
        keyPair.privateKey
      );
      const privateKeyBase64 = arrayBufferToBase64(pkcs8);

      localStorage.setItem("privateKey", privateKeyBase64);

      const payload = {
        username: name,
        email,
        password,
        publicKey: publicKeyBase64,
      };

      await axios.post("/api/auth/register", payload);

      toast({
        title: "Conta criada com sucesso!",
        description: "Você já pode fazer o login.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      navigate("/login");
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Erro ao criar conta.",
        status: "error",
        description:
          err.response?.data?.message || "Tente novamente mais tarde.",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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
      <Box pos="absolute" inset="0" bg="blackAlpha.400" zIndex={0} />

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
              <FormLabel>Nome</FormLabel>
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome de usuário"
              />
              {isSubmitted && isNameError && (
                <FormErrorMessage>
                  Nome de usuário é obrigatório.
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
                <FormErrorMessage>E-mail inválido.</FormErrorMessage>
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
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="digite novamente"
              />
              {isSubmitted && isConfirmError && (
                <FormErrorMessage>As senhas não coincidem.</FormErrorMessage>
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
          Já tem uma conta?{" "}
          <Button as={RouterLink} to="/login" variant="link" colorScheme="red">
            Entrar
          </Button>
        </Text>
      </Container>
    </Box>
  );
}
