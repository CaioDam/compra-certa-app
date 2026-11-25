import { useState } from 'react';
import { View, Text, Image, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import CampoTexto from '../componentes/CampoTexto';
import Botao from '../componentes/Botao';
import { api } from '../servicos/api';
import { cores } from '../theme/cores';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erros, setErros] = useState({});
  const [carregando, setCarregando] = useState(false);

  function validar() {
    const novosErros = {};

    if (!email.trim()) {
      novosErros.email = 'Digite seu e-mail';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      novosErros.email = 'E-mail inválido';
    }

    if (!senha) {
      novosErros.senha = 'Digite sua senha';
    } else if (senha.length < 6) {
      novosErros.senha = 'A senha precisa ter no mínimo 6 caracteres';
    }

    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  }

  async function entrar() {
    if (!validar()) return;

    setCarregando(true);
    try {
      await api.entrar(email.trim(), senha);
      navigation.replace('Abas');
    } catch (erro) {
      setErros({ geral: erro.message });
    } finally {
      setCarregando(false);
    }
  }

  return (
    <KeyboardAvoidingView style={estilos.tela} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={estilos.conteudo} keyboardShouldPersistTaps="handled">
        <Image source={require('../../assets/logo.png')} style={estilos.logo} />
        <Text style={estilos.titulo}>Compra Certa</Text>
        <Text style={estilos.subtitulo}>A compra mais inteligente</Text>

        <View style={estilos.formulario}>
          <CampoTexto
            label="E-mail"
            valor={email}
            aoMudar={setEmail}
            placeholder="seuemail@exemplo.com"
            erro={erros.email}
            tipoTeclado="email-address"
          />
          <CampoTexto
            label="Senha"
            valor={senha}
            aoMudar={setSenha}
            placeholder="Digite sua senha"
            erro={erros.senha}
            senha
          />

          {erros.geral ? <Text style={estilos.erroGeral}>{erros.geral}</Text> : null}
          <Text style={estilos.link} onPress={() => navigation.navigate('EsqueceuSenha')}>
            Esqueceu a senha?
          </Text>
          <Botao texto="Entrar" aoPressionar={entrar} carregando={carregando} />
          <Botao
            texto="Criar uma conta"
            variante="secundario"
            aoPressionar={() => navigation.navigate('Cadastro')}
          />
          <Text style={estilos.linkArquitetura} onPress={() => navigation.navigate('SystemDesign')}>
            Conheça a arquitetura do sistema
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  conteudo: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 28, paddingVertical: 40 },
  logo: { width: 84, height: 84, alignSelf: 'center', borderRadius: 20, marginBottom: 14 },
  titulo: { fontSize: 26, fontWeight: '800', color: cores.grafite, textAlign: 'center' },
  subtitulo: { fontSize: 13, color: cores.verde, textAlign: 'center', marginTop: 4, marginBottom: 32 },
  formulario: { width: '100%' },
  link: { color: cores.verdeEscuro, fontSize: 14, fontWeight: '600', textAlign: 'right', marginBottom: 10 },
  linkArquitetura: { color: cores.cinza, fontSize: 13, textAlign: 'center', marginTop: 18 },
  erroGeral: { color: cores.vermelho, fontSize: 13, marginBottom: 8 },
});
