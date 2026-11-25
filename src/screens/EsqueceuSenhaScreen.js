import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import Botao from '../componentes/Botao';
import CampoTexto from '../componentes/CampoTexto';
import { api } from '../servicos/api';
import { cores } from '../theme/cores';

const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function EsqueceuSenhaScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [codigo, setCodigo] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [erros, setErros] = useState({});
  const [codigoEnviado, setCodigoEnviado] = useState(false);
  const [carregando, setCarregando] = useState(false);

  async function solicitarCodigo() {
    const novoErro = EMAIL_VALIDO.test(email.trim()) ? '' : 'Digite um e-mail válido';
    setErros(novoErro ? { email: novoErro } : {});
    if (novoErro) return;

    setCarregando(true);
    try {
      const resposta = await api.solicitarRedefinicao(email.trim());
      setCodigoEnviado(true);
      if (resposta.demo_token) {
        setCodigo(resposta.demo_token);
      }
    } catch (erro) {
      Alert.alert('Não foi possível continuar', erro.message);
    } finally {
      setCarregando(false);
    }
  }

  async function redefinirSenha() {
    const novosErros = {};
    if (!codigo.trim()) novosErros.codigo = 'Digite o código de recuperação';
    if (senha.length < 8) novosErros.senha = 'A senha precisa ter no mínimo 8 caracteres';
    if (confirmarSenha !== senha) novosErros.confirmarSenha = 'As senhas não são iguais';
    setErros(novosErros);
    if (Object.keys(novosErros).length) return;

    setCarregando(true);
    try {
      await api.redefinirSenha({ email: email.trim(), token: codigo.trim(), senha });
      Alert.alert('Senha atualizada', 'Agora você já pode entrar com sua nova senha.', [
        { text: 'Ir para o login', onPress: () => navigation.goBack() },
      ]);
    } catch (erro) {
      Alert.alert('Não foi possível redefinir a senha', erro.message);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <KeyboardAvoidingView style={estilos.tela} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={estilos.conteudo} keyboardShouldPersistTaps="handled">
        <View style={estilos.icone}><Text style={estilos.iconeTexto}>?</Text></View>
        <Text style={estilos.titulo}>Esqueceu a senha?</Text>
        <Text style={estilos.subtitulo}>
          {codigoEnviado
            ? 'Use o código de recuperação e escolha uma nova senha.'
            : 'Informe o e-mail da sua conta para iniciar a recuperação.'}
        </Text>

        <View style={estilos.formulario}>
          <CampoTexto
            label="E-mail"
            valor={email}
            aoMudar={setEmail}
            placeholder="seuemail@exemplo.com"
            erro={erros.email}
            tipoTeclado="email-address"
          />
          {codigoEnviado ? (
            <>
              <CampoTexto label="Código de recuperação" valor={codigo} aoMudar={setCodigo} erro={erros.codigo} />
              <CampoTexto
                label="Nova senha"
                valor={senha}
                aoMudar={setSenha}
                placeholder="Mínimo de 8 caracteres"
                erro={erros.senha}
                senha
              />
              <CampoTexto
                label="Confirmar nova senha"
                valor={confirmarSenha}
                aoMudar={setConfirmarSenha}
                erro={erros.confirmarSenha}
                senha
              />
            </>
          ) : null}
          <Botao
            texto={codigoEnviado ? 'Redefinir senha' : 'Enviar código'}
            aoPressionar={codigoEnviado ? redefinirSenha : solicitarCodigo}
            carregando={carregando}
          />
          <Botao texto="Voltar para o login" variante="secundario" aoPressionar={() => navigation.goBack()} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  conteudo: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 28, paddingVertical: 40 },
  icone: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: cores.branco,
    marginBottom: 18,
  },
  iconeTexto: { color: cores.verde, fontSize: 32, fontWeight: '700' },
  titulo: { fontSize: 24, fontWeight: '800', color: cores.grafite, textAlign: 'center' },
  subtitulo: { fontSize: 14, lineHeight: 21, color: cores.cinza, textAlign: 'center', marginTop: 8, marginBottom: 28 },
  formulario: { width: '100%' },
});
