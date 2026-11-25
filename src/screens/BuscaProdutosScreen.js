import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Botao from '../componentes/Botao';
import { api } from '../servicos/api';
import { cores } from '../theme/cores';

export default function BuscaProdutosScreen() {
  const [consulta, setConsulta] = useState('');
  const [resposta, setResposta] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  async function pesquisar() {
    const consultaLimpa = consulta.trim();
    if (!consultaLimpa || carregando) return;

    setCarregando(true);
    setErro('');
    setResposta('');
    try {
      const resultado = await api.buscarProdutos(consultaLimpa);
      setResposta(resultado.answer);
    } catch (error) {
      setErro(error.message);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <ScrollView style={estilos.tela} contentContainerStyle={estilos.conteudo}>
      <Text style={estilos.titulo}>Encontre o produto ideal</Text>
      <Text style={estilos.descricao}>
        Descreva o que procura para receber uma orientação geral do Gemini.
      </Text>

      <TextInput
        style={estilos.campo}
        value={consulta}
        onChangeText={setConsulta}
        placeholder="Ex.: fone sem fio para academia"
        placeholderTextColor={cores.cinza}
        multiline
        maxLength={500}
        textAlignVertical="top"
      />
      <Botao
        texto="Pesquisar"
        aoPressionar={pesquisar}
        carregando={carregando}
      />

      {erro ? <Text style={estilos.erro}>{erro}</Text> : null}
      {resposta ? (
        <View style={estilos.cartao}>
          <Text style={estilos.tituloResposta}>Recomendação</Text>
          <Text style={estilos.resposta}>{resposta}</Text>
        </View>
      ) : null}
      <Text style={estilos.aviso}>
        Esta orientação não consulta lojas nem confirma preços ou disponibilidade atuais.
      </Text>
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  conteudo: { padding: 20, paddingBottom: 32 },
  titulo: { fontSize: 20, fontWeight: '800', color: cores.grafite },
  descricao: { fontSize: 14, color: cores.cinza, marginTop: 6, marginBottom: 18 },
  campo: {
    minHeight: 110,
    borderWidth: 1,
    borderColor: cores.cinzaClaro,
    borderRadius: 12,
    padding: 14,
    backgroundColor: cores.branco,
    color: cores.grafite,
    fontSize: 15,
  },
  erro: { color: cores.vermelho, fontSize: 13, marginTop: 14 },
  cartao: { backgroundColor: cores.branco, borderRadius: 12, padding: 16, marginTop: 20 },
  tituloResposta: { fontSize: 16, fontWeight: '700', color: cores.grafite, marginBottom: 8 },
  resposta: { fontSize: 14, lineHeight: 21, color: cores.grafite },
  aviso: { fontSize: 12, lineHeight: 18, color: cores.cinza, marginTop: 16 },
});
