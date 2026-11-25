import { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, Alert, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import IconeBootstrap from '../componentes/IconeBootstrap';
import Botao from '../componentes/Botao';
import CampoTexto from '../componentes/CampoTexto';
import { api } from '../servicos/api';
import { cores } from '../theme/cores';

export default function PerfilScreen({ navigation }) {
  const [foto, setFoto] = useState(null);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');

  useEffect(() => {
    api.obterConta()
      .then((conta) => {
        setNome(conta.name);
        setEmail(conta.email);
      })
      .catch((erroApi) => setErro(erroApi.message))
      .finally(() => setCarregando(false));
  }, []);

  async function salvarPerfil() {
    setSalvando(true);
    setErro('');
    try {
      const conta = await api.atualizarConta({ nome: nome.trim(), email: email.trim() });
      setNome(conta.name);
      setEmail(conta.email);
      Alert.alert('Perfil atualizado', 'Seus dados foram salvos.');
    } catch (erroApi) {
      setErro(erroApi.message);
    } finally {
      setSalvando(false);
    }
  }

  function confirmarExclusao() {
    Alert.alert('Excluir conta', 'Esta ação não pode ser desfeita. Deseja excluir sua conta?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.excluirConta();
            navigation.getParent()?.replace('Login');
          } catch (erroApi) {
            Alert.alert('Não foi possível excluir a conta', erroApi.message);
          }
        },
      },
    ]);
  }

  async function sair() {
    try {
      await api.sair();
      navigation.getParent()?.replace('Login');
    } catch (erroApi) {
      Alert.alert('Não foi possível sair', erroApi.message);
    }
  }

  async function escolherFoto() {
    Alert.alert('Foto de perfil', 'Como você quer adicionar a foto?', [
      { text: 'Tirar foto agora', onPress: tirarFoto },
      { text: 'Escolher da galeria', onPress: escolherDaGaleria },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  }

  async function tirarFoto() {
    const permissao = await ImagePicker.requestCameraPermissionsAsync();

    if (!permissao.granted) {
      Alert.alert('Permissão necessária', 'Precisamos da câmera para tirar sua foto.');
      return;
    }

    const resultado = await ImagePicker.launchCameraAsync({ quality: 0.6, allowsEditing: true });

    if (!resultado.canceled) {
      setFoto(resultado.assets[0].uri);
    }
  }

  async function escolherDaGaleria() {
    const resultado = await ImagePicker.launchImageLibraryAsync({ quality: 0.6, allowsEditing: true });

    if (!resultado.canceled) {
      setFoto(resultado.assets[0].uri);
    }
  }

  if (carregando) {
    return <View style={estilos.carregando}><ActivityIndicator color={cores.verde} /></View>;
  }

  return (
    <ScrollView contentContainerStyle={estilos.tela} keyboardShouldPersistTaps="handled">
      <TouchableOpacity style={estilos.areaFoto} onPress={escolherFoto} activeOpacity={0.8}>
        {foto ? (
          <Image source={{ uri: foto }} style={estilos.foto} />
        ) : (
          <View style={estilos.fotoVazia}>
            <IconeBootstrap nome="camera" tamanho={28} cor={cores.cinza} />
          </View>
        )}
        <Text style={estilos.trocarFoto}>Trocar foto</Text>
      </TouchableOpacity>

      <Text style={estilos.nome}>{nome}</Text>
      <Text style={estilos.email}>{email}</Text>

      {erro ? <Text style={estilos.erro}>{erro}</Text> : null}
      <View style={estilos.formulario}>
        <CampoTexto label="Nome" valor={nome} aoMudar={setNome} />
        <CampoTexto label="E-mail" valor={email} aoMudar={setEmail} tipoTeclado="email-address" />
        <Botao texto="Salvar alterações" aoPressionar={salvarPerfil} carregando={salvando} />
      </View>
      <View style={estilos.opcoes}>
        <View style={estilos.opcao}>
          <View style={estilos.linhaOpcao}>
            <IconeBootstrap nome="caixa" tamanho={17} cor={cores.verde} style={estilos.iconeOpcao} />
            <Text style={estilos.opcaoTexto}>Minhas listas salvas</Text>
          </View>
        </View>
        <View style={estilos.opcao}>
          <View style={estilos.linhaOpcao}>
            <IconeBootstrap nome="sino" tamanho={17} cor={cores.verde} style={estilos.iconeOpcao} />
            <Text style={estilos.opcaoTexto}>Alertas de preço</Text>
          </View>
        </View>
        <View style={estilos.opcao}>
          <View style={estilos.linhaOpcao}>
            <IconeBootstrap nome="localizacao" tamanho={17} cor={cores.verde} style={estilos.iconeOpcao} />
            <Text style={estilos.opcaoTexto}>Meu CEP padrão</Text>
          </View>
        </View>
      </View>

      <Botao texto="Excluir minha conta" variante="secundario" aoPressionar={confirmarExclusao} />
      <Botao texto="Sair" variante="secundario" aoPressionar={sair} />
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  tela: { flexGrow: 1, backgroundColor: cores.fundo, paddingHorizontal: 20, paddingTop: 24, alignItems: 'center' },
  areaFoto: { alignItems: 'center', marginBottom: 16 },
  foto: { width: 96, height: 96, borderRadius: 48, marginBottom: 8 },
  fotoVazia: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: cores.branco,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  trocarFoto: { fontSize: 12.5, color: cores.verdeEscuro, fontWeight: '600' },
  nome: { fontSize: 18, fontWeight: '800', color: cores.grafite },
  email: { fontSize: 13, color: cores.cinza, marginBottom: 24 },
  opcoes: { width: '100%', marginBottom: 24 },
  opcao: { backgroundColor: cores.branco, borderRadius: 12, padding: 16, marginBottom: 8 },
  opcaoTexto: { fontSize: 14, color: cores.grafite, fontWeight: '600' },
  linhaOpcao: { flexDirection: 'row', alignItems: 'center' },
  iconeOpcao: { marginRight: 10 },
  carregando: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: cores.fundo },
  formulario: { width: '100%', marginBottom: 16 },
  erro: { color: cores.vermelho, fontSize: 13, marginBottom: 12, textAlign: 'center' },
});
