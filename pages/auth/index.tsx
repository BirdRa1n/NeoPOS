"use client";
import { Box } from "@gravity-ui/icons";
import {
    Button,
    Description,
    FieldError,
    FieldGroup,
    Fieldset,
    Form,
    Input,
    Label,
    TextArea,
    TextField,
    Tabs,
    Card,
    Checkbox,
    Link
} from "@heroui/react";
import { useState, FormEvent } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [storeName, setStoreName] = useState('');
    const [loading, setLoading] = useState(false);
    const { signIn } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await signIn(email, password);
            toast.success('Login realizado com sucesso!');
            router.push('/dashboard');
        } catch (error: any) {
            toast.error(error.message || 'Erro ao fazer login');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center">
            <div className="flex flex-col items-center justify-center min-h-screen">
                <div className="flex flex-col items-center gap-1 mb-6">
                    <div className="flex flex-row items-center gap-2">
                        <Box width={32} height={32} color="#0485f7" />
                        <h1 className="text-3xl font-bold">NeoPOS</h1>
                    </div>
                    <p className="text-gray-600 text-sm">
                        Gestão de vendas simplificada para pequenos negócios.
                    </p>
                </div>
                <Card className="w-full max-w-md ">
                    <Tabs className="w-full max-w-md">
                        <Tabs.ListContainer>
                            <Tabs.List aria-label="Options">
                                <Tabs.Tab id="signin">
                                    Entrar
                                    <Tabs.Indicator />
                                </Tabs.Tab>
                                <Tabs.Tab id="signup">
                                    Cadastrar
                                    <Tabs.Indicator />
                                </Tabs.Tab>
                            </Tabs.List>
                        </Tabs.ListContainer>
                        <Tabs.Panel className="pt-4" id="signin">
                            <Form className="flex w-96 flex-col gap-4" onSubmit={handleSubmit}>
                                <TextField
                                    isRequired
                                    name="email"
                                    type="email"
                                    onChange={(e) => setEmail(e)}
                                    validate={(value) => {
                                        if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value)) {
                                            return "Please enter a valid email address";
                                        }
                                        return null;
                                    }}
                                >
                                    <Label>E-mail</Label>
                                    <Input placeholder="john@exemplo.com" />
                                    <Description>Digite seu e-mail para acessar sua conta</Description>
                                    <FieldError />
                                </TextField>
                                <TextField
                                    isRequired
                                    minLength={8}
                                    name="password"
                                    type="password"
                                    onChange={(e) => setPassword(e)}
                                    validate={(value) => {
                                        if (value.length < 8) {
                                            return "Password must be at least 8 characters";
                                        }
                                        if (!/[A-Z]/.test(value)) {
                                            return "Password must contain at least one uppercase letter";
                                        }
                                        if (!/[0-9]/.test(value)) {
                                            return "Password must contain at least one number";
                                        }
                                        return null;
                                    }}
                                >
                                    <Label>Senha</Label>
                                    <Input placeholder="Insira sua senha" />
                                    <Description>Digite sua senha para acessar sua conta</Description>
                                    <FieldError />
                                </TextField>



                                <div className="w-full flex justify-between">
                                    <Checkbox id="basic-terms">
                                        <Checkbox.Control>
                                            <Checkbox.Indicator />
                                        </Checkbox.Control>
                                        <Checkbox.Content>
                                            <Label className="text-muted">Lembre de min</Label>
                                        </Checkbox.Content>
                                    </Checkbox>

                                    <Link className="text-blue-500 no-underline" href="/forgot-password">
                                        Esqueci minha senha
                                    </Link>
                                </div>
                                <div className="flex w-full">
                                    <Button type="submit" className="w-full">
                                        Entrar
                                    </Button>
                                </div>
                            </Form>
                        </Tabs.Panel>
                        <Tabs.Panel className="pt-4" id="signup">
                            <Form className="flex w-96 flex-col gap-4" onSubmit={handleSubmit}>
                                <TextField
                                    isRequired
                                    name="store_name"
                                    type="text"
                                    onChange={(e) => setStoreName(e)}
                                    validate={(value) => {
                                        if (!value.trim()) {
                                            return "Store name is required";
                                        }
                                        return null;
                                    }}
                                >
                                    <Label>Nome da Loja</Label>
                                    <Input placeholder="Digite o nome da sua loja" />
                                    <Description>Digite o nome da sua loja</Description>
                                    <FieldError />
                                </TextField>

                                <TextField
                                    isRequired
                                    name="email"
                                    type="email"
                                    onChange={(e) => setEmail(e)}
                                    validate={(value) => {
                                        if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value)) {
                                            return "Please enter a valid email address";
                                        }
                                        return null;
                                    }}
                                >
                                    <Label>E-mail</Label>
                                    <Input placeholder="john@exemplo.com" />
                                    <Description>Digite seu e-mail para acessar sua conta</Description>
                                    <FieldError />
                                </TextField>
                                <TextField
                                    isRequired
                                    minLength={8}
                                    name="password"
                                    type="password"
                                    onChange={(e) => setPassword(e)}
                                    validate={(value) => {
                                        if (value.length < 8) {
                                            return "Password must be at least 8 characters";
                                        }
                                        if (!/[A-Z]/.test(value)) {
                                            return "Password must contain at least one uppercase letter";
                                        }
                                        if (!/[0-9]/.test(value)) {
                                            return "Password must contain at least one number";
                                        }
                                        return null;
                                    }}
                                >
                                    <Label>Senha</Label>
                                    <Input placeholder="Insira sua senha" />
                                    <Description>Digite sua senha para acessar sua conta</Description>
                                    <FieldError />
                                </TextField>
                                <div className="flex w-full">
                                    <Button type="submit" className="w-full">
                                        Entrar
                                    </Button>
                                </div>
                            </Form>
                        </Tabs.Panel>

                    </Tabs>
                </Card>
            </div>
        </div>
    );
}
