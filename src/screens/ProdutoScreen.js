import { useCallback, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Botao from '../componentes/Botao';
import { api } from '../servicos/api';
import { cores } from '../theme/cores';

export default function ProdutoScreen({ route, navigation }) {
  const { produtoId } = route.params;
  const [produto, setProduto] = useState(null);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(true);

  useFocusEffect(useCallback(() => {
    setCarregando(true);
    setErro('');
    api.obterProduto(produtoId)
      .then(setProduto)
      .catch((erroApi) => setErro(erroApi.message))
      .finally(() => setCarregando(false));
  }, [produtoId]));

  async function atualizarProduto(dados) {
    try {
      setProduto(await api.atualizarProduto(produto.id, dados));
    } catch (erroApi) {
      setErro(erroApi.message);
    }
  }

  if (carregando) {
    return <Text style={estilos.mensagem}>Carregando produto...</Text>;
  }

  if (!produto) {
    return <Text style={estilos.erro}>{erro || 'Produto não encontrado.'}</Text>;
  }

  return (
    <ScrollView style={estilos.tela} contentContainerStyle={estilos.conteudo}>
      {produto.image ? (
        <Image source={{ uri: produto.image }} style={estilos.imagem} resizeMode="cover" />
      ) : null}
      <Text style={estilos.titulo}>{produto.name}</Text>
      {produto.category ? <Text style={estilos.categoria}>{produto.category}</Text> : null}
      {produto.description ? (
        <Text style={estilos.descricao}>{produto.description}</Text>
      ) : (
        <Text style={estilos.aviso}>Nenhuma descrição informada.</Text>
      )}

      {erro ? <Text style={estilos.erro}>{erro}</Text> : null}
      <View style={estilos.acoes}>
        <Botao
          texto={produto.is_favorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
          variante="secundario"
          aoPressionar={() => atualizarProduto({ is_favorite: !produto.is_favorite })}
        />
        <Botao
          texto={produto.in_shopping_list ? 'Remover da lista' : 'Adicionar à lista'}
          variante="secundario"
          aoPressionar={() => atualizarProduto({ in_shopping_list: !produto.in_shopping_list })}
        />
        <Botao
          texto="Editar produto"
          aoPressionar={() => navigation.navigate('FormularioProduto', { produto })}
        />
      </View>
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  conteudo: { padding: 20 },
  imagem: { width: '100%', height: 240, borderRadius: 14, marginBottom: 16 },
  titulo: { color: cores.grafite, fontSize: 22, fontWeight: '800' },
  categoria: { color: cores.verdeEscuro, fontSize: 14, marginTop: 6 },
  descricao: { color: cores.grafite, fontSize: 15, lineHeight: 22, marginTop: 16 },
  aviso: { color: cores.cinza, fontSize: 13, marginTop: 16 },
  acoes: { marginTop: 16 },
  erro: { color: cores.vermelho, fontSize: 13, marginTop: 14 },
  mensagem: { color: cores.cinza, fontSize: 14, margin: 20 },
});
