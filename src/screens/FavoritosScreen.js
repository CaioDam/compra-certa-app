import { useCallback, useState } from 'react';
import { FlatList, StyleSheet, Text } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import CartaoProduto from '../componentes/CartaoProduto';
import { api } from '../servicos/api';
import { cores } from '../theme/cores';

export default function FavoritosScreen({ navigation }) {
  const [produtos, setProdutos] = useState([]);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(true);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro('');
    try {
      setProdutos(await api.listarFavoritos());
    } catch (erroApi) {
      setErro(erroApi.message);
    } finally {
      setCarregando(false);
    }
  }, []);

  useFocusEffect(useCallback(() => {
    carregar();
  }, [carregar]));

  async function removerFavorito(produto) {
    try {
      await api.atualizarProduto(produto.id, { is_favorite: false });
      await carregar();
    } catch (erroApi) {
      setErro(erroApi.message);
    }
  }

  return (
    <FlatList
      style={estilos.tela}
      contentContainerStyle={estilos.conteudo}
      data={produtos}
      keyExtractor={(produto) => String(produto.id)}
      ListHeaderComponent={
        <>
          <Text style={estilos.titulo}>Favoritos</Text>
          {erro ? <Text style={estilos.erro}>{erro}</Text> : null}
          {carregando ? <Text style={estilos.mensagem}>Carregando favoritos...</Text> : null}
        </>
      }
      renderItem={({ item }) => (
        <CartaoProduto
          produto={item}
          aoPressionar={() => navigation.navigate('Produto', { produtoId: item.id })}
          aoFavoritar={() => removerFavorito(item)}
        />
      )}
      ListEmptyComponent={
        !carregando && !erro ? (
          <Text style={estilos.mensagem}>Você ainda não adicionou favoritos.</Text>
        ) : null
      }
    />
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  conteudo: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24 },
  titulo: { color: cores.grafite, fontSize: 20, fontWeight: '800', marginBottom: 14 },
  erro: { color: cores.vermelho, fontSize: 13, marginBottom: 10 },
  mensagem: { color: cores.cinza, fontSize: 13, textAlign: 'center', marginTop: 24 },
});
