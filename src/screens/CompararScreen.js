import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { api } from '../servicos/api';
import { cores } from '../theme/cores';

export default function CompararScreen() {
  const [produtos, setProdutos] = useState([]);
  const [selecionados, setSelecionados] = useState([]);
  const [erro, setErro] = useState('');

  useEffect(() => {
    api.listarProdutos()
      .then(setProdutos)
      .catch((erroApi) => setErro(erroApi.message));
  }, []);

  function alternarSelecao(produto) {
    setErro('');
    if (selecionados.some((item) => item.id === produto.id)) {
      setSelecionados(selecionados.filter((item) => item.id !== produto.id));
    } else if (selecionados.length < 2) {
      setSelecionados([...selecionados, produto]);
    } else {
      setErro('Selecione no máximo dois produtos.');
    }
  }

  return (
    <FlatList
      style={estilos.tela}
      contentContainerStyle={estilos.conteudo}
      data={produtos}
      keyExtractor={(produto) => String(produto.id)}
      ListHeaderComponent={
        <View>
          <Text style={estilos.titulo}>Comparar produtos</Text>
          <Text style={estilos.aviso}>Selecione até dois produtos cadastrados. Esta tela não consulta preços de lojas.</Text>
          {erro ? <Text style={estilos.erro}>{erro}</Text> : null}
          {selecionados.length ? (
            <View style={estilos.comparacao}>
              {selecionados.map((produto) => (
                <View key={produto.id} style={estilos.cartao}>
                  <Text style={estilos.nome}>{produto.name}</Text>
                  {produto.category ? <Text style={estilos.categoria}>{produto.category}</Text> : null}
                  {produto.description ? <Text style={estilos.descricao}>{produto.description}</Text> : null}
                </View>
              ))}
            </View>
          ) : null}
        </View>
      }
      renderItem={({ item }) => {
        const selecionado = selecionados.some((produto) => produto.id === item.id);
        return (
          <TouchableOpacity
            style={[estilos.item, selecionado && estilos.itemSelecionado]}
            onPress={() => alternarSelecao(item)}
          >
            <Text style={estilos.nome}>{item.name}</Text>
            <Text style={estilos.selecao}>{selecionado ? 'Selecionado' : 'Toque para comparar'}</Text>
          </TouchableOpacity>
        );
      }}
      ListEmptyComponent={
        !erro ? <Text style={estilos.vazio}>Cadastre produtos para poder compará-los.</Text> : null
      }
    />
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  conteudo: { padding: 20, paddingBottom: 32 },
  titulo: { color: cores.grafite, fontSize: 20, fontWeight: '800', marginBottom: 8 },
  aviso: { color: cores.cinza, fontSize: 12, lineHeight: 18, marginBottom: 14 },
  erro: { color: cores.vermelho, fontSize: 13, marginBottom: 10 },
  comparacao: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10 },
  cartao: { flexGrow: 1, flexBasis: '45%', backgroundColor: cores.branco, borderRadius: 12, padding: 12, marginRight: 8, marginBottom: 8 },
  item: { backgroundColor: cores.branco, borderRadius: 12, padding: 14, marginBottom: 8 },
  itemSelecionado: { borderWidth: 1.5, borderColor: cores.verde },
  nome: { color: cores.grafite, fontSize: 14, fontWeight: '700' },
  categoria: { color: cores.verdeEscuro, fontSize: 12, marginTop: 4 },
  descricao: { color: cores.cinza, fontSize: 12, lineHeight: 17, marginTop: 6 },
  selecao: { color: cores.verdeEscuro, fontSize: 11, marginTop: 5 },
  vazio: { color: cores.cinza, fontSize: 13, textAlign: 'center', marginTop: 24 },
});
