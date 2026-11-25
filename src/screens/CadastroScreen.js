import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import CampoTexto from '../componentes/CampoTexto';
import Botao from '../componentes/Botao';
import { api } from '../servicos/api';
import { cores } from '../theme/cores';

export default function CadastroScreen({ navigation }) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [aceitouPrivacidade, setAceitouPrivacidade] = useState(false);
  const [erros, setErros] = useState({});
  const [carregando, setCarregando] = useState(false);

  function validar() {
    const novosErros = {};

    if (!nome.trim()) {
      novosErros.nome = 'Digite seu nome';
    } else if (nome.trim().length < 3) {
      novosErros.nome = 'O nome precisa ter no mínimo 3 letras';
    }

    if (!email.trim()) {
      novosErros.email = 'Digite seu e-mail';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      novosErros.email = 'E-mail inválido';
    }

    if (!senha) {
      novosErros.senha = 'Crie uma senha';
    } else if (senha.length < 8) {
      novosErros.senha = 'A senha precisa ter no mínimo 8 caracteres';
    }

    if (confirmarSenha !== senha) {
      novosErros.confirmarSenha = 'As senhas não são iguais';
    }

    if (!aceitouPrivacidade) {
      novosErros.privacidade = 'Aceite o aviso de privacidade para continuar.';
    }

    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  }

  async function criarConta() {
    if (!validar()) return;

    setCarregando(true);
    try {
      await api.cadastrar({
        nome: nome.trim(),
        email: email.trim(),
        senha,
        aceitouPrivacidade,
      });
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
        <Text style={estilos.titulo}>Criar conta</Text>
        <Text style={estilos.subtitulo}>Leva menos de um minuto</Text>

        <View style={estilos.formulario}>
          <CampoTexto label="Nome" valor={nome} aoMudar={setNome} placeholder="Seu nome" erro={erros.nome} />
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
            placeholder="Mínimo de 8 caracteres"
            erro={erros.senha}
            senha
          />
          <CampoTexto
            label="Confirmar senha"
            valor={confirmarSenha}
            aoMudar={setConfirmarSenha}
            placeholder="Digite a senha novamente"
            erro={erros.confirmarSenha}
            senha
          />

          <View style={estilos.avisoPrivacidade}>
            <Text style={estilos.tituloPrivacidade}>Aviso de privacidade</Text>
            <Text style={estilos.textoPrivacidade}>
              Nome, e-mail e produtos cadastrados ficam no banco SQLite do backend, no computador
              ou servidor que executa o projeto. A senha é armazenada protegida por hash. A foto
              de perfil fica neste aparelho; imagens dos produtos são enviadas ao servidor do
              backend. Ao pedir uma orientação, o texto da busca é enviado ao Gemini, serviço do
              Google. Você pode excluir sua conta e os produtos associados no Perfil.
            </Text>
            <TouchableOpacity
              style={estilos.aceite}
              onPress={() => setAceitouPrivacidade(!aceitouPrivacidade)}
              activeOpacity={0.8}
            >
              <View style={[estilos.caixa, aceitouPrivacidade && estilos.caixaMarcada]}>
                {aceitouPrivacidade ? <Text style={estilos.marca}>✓</Text> : null}
              </View>
              <Text style={estilos.textoAceite}>Li e aceito o aviso de privacidade</Text>
            </TouchableOpacity>
          </View>
          {erros.privacidade ? <Text style={estilos.erroGeral}>{erros.privacidade}</Text> : null}
          {erros.geral ? <Text style={estilos.erroGeral}>{erros.geral}</Text> : null}
          <Botao texto="Criar conta" aoPressionar={criarConta} carregando={carregando} />
          <Botao texto="Já tenho conta" variante="secundario" aoPressionar={() => navigation.goBack()} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  conteudo: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 28, paddingVertical: 40 },
  titulo: { fontSize: 24, fontWeight: '800', color: cores.grafite, textAlign: 'center' },
  subtitulo: { fontSize: 13, color: cores.cinza, textAlign: 'center', marginTop: 4, marginBottom: 28 },
  formulario: { width: '100%' },
  erroGeral: { color: cores.vermelho, fontSize: 13, marginBottom: 8 },
  avisoPrivacidade: { backgroundColor: cores.branco, borderRadius: 12, padding: 14, marginBottom: 12 },
  tituloPrivacidade: { color: cores.grafite, fontSize: 14, fontWeight: '700', marginBottom: 6 },
  textoPrivacidade: { color: cores.cinza, fontSize: 12, lineHeight: 18 },
  aceite: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
  caixa: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: cores.cinza,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  caixaMarcada: { backgroundColor: cores.verde, borderColor: cores.verde },
  marca: { color: cores.branco, fontSize: 14, fontWeight: '700' },
  textoAceite: { color: cores.grafite, fontSize: 12, flexShrink: 1 },
});
