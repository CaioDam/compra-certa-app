import { useCallback, useState } from 'react';
import { Alert, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Botao from '../componentes/Botao';
import CartaoProduto from '../componentes/CartaoProduto';
import { api } from '../servicos/api';
import { cores } from '../theme/cores';

export default function HomeScreen({ navigation }) {
  const [produtos, setProdutos] = useState([]);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(true);

  const carregarProdutos = useCallback(async () => {
    setCarregando(true);
    setErro('');
    try {
      setProdutos(await api.listarProdutos());
    } catch (erroApi) {
      setErro(erroApi.message);
    } finally {
      setCarregando(false);
    }
  }, []);

  useFocusEffect(useCallback(() => {
    carregarProdutos();
  }, [carregarProdutos]));

  async function atualizarProduto(id, dados) {
    try {
      await api.atualizarProduto(id, dados);
      await carregarProdutos();
    } catch (erroApi) {
      setErro(erroApi.message);
    }
  }

  function excluirProduto(produto) {
    Alert.alert('Excluir produto', `Deseja excluir "${produto.name}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.excluirProduto(produto.id);
            await carregarProdutos();
          } catch (erroApi) {
            setErro(erroApi.message);
          }
        },
      },
    ]);
  }

  const categorias = [...new Set(produtos.map((produto) => produto.category).filter(Boolean))];

  return (
    <FlatList
      style={estilos.tela}
      contentContainerStyle={estilos.conteudo}
      data={produtos}
      keyExtractor={(produto) => String(produto.id)}
      ListHeaderComponent={
        <View>
          <View style={estilos.cabecalho}>
            <Image source={require('../../assets/logo.png')} style={estilos.logo} />
            <View>
              <Text style={estilos.saudacao}>Olá!</Text>
              <Text style={estilos.titulo}>Meus produtos</Text>
            </View>
          </View>
          <Botao texto="Cadastrar produto" aoPressionar={() => navigation.navigate('FormularioProduto')} />
          <Botao
            texto="Pedir orientação ao Gemini"
            variante="secundario"
            aoPressionar={() => navigation.navigate('BuscaProdutos')}
          />
          <Botao
            texto="Comparar meus produtos"
            variante="secundario"
            aoPressionar={() => navigation.navigate('Comparar')}
          />
          {categorias.length ? (
            <View style={estilos.categorias}>
              {categorias.map((categoria) => (
                <TouchableOpacity
                  key={categoria}
                  style={estilos.categoria}
                  onPress={() => navigation.navigate('Categoria', { nome: categoria })}
                >
                  <Text style={estilos.textoCategoria}>{categoria}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : null}
          {erro ? <Text style={estilos.erro}>{erro}</Text> : null}
          {carregando ? <Text style={estilos.mensagem}>Carregando produtos...</Text> : null}
        </View>
      }
      renderItem={({ item }) => (
        <CartaoProduto
          produto={item}
          aoPressionar={() => navigation.navigate('Produto', { produtoId: item.id })}
          aoFavoritar={() => atualizarProduto(item.id, { is_favorite: !item.is_favorite })}
          aoAlternarLista={() => atualizarProduto(item.id, { in_shopping_list: !item.in_shopping_list })}
          aoEditar={() => navigation.navigate('FormularioProduto', { produto: item })}
          aoExcluir={() => excluirProduto(item)}
        />
      )}
      ListEmptyComponent={
        !carregando && !erro ? (
          <Text style={estilos.mensagem}>Você ainda não cadastrou produtos.</Text>
        ) : null
      }
    />
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  conteudo: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24 },
  cabecalho: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  logo: { width: 42, height: 42, borderRadius: 10, marginRight: 10 },
  saudacao: { color: cores.cinza, fontSize: 12 },
  titulo: { color: cores.grafite, fontSize: 20, fontWeight: '800' },
  categorias: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 16 },
  categoria: {
    backgroundColor: cores.branco,
    borderColor: cores.cinzaClaro,
    borderRadius: 18,
    borderWidth: 1,
    marginRight: 8,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  textoCategoria: { color: cores.verdeEscuro, fontSize: 12, fontWeight: '600' },
  erro: { color: cores.vermelho, fontSize: 13, marginTop: 14 },
  mensagem: { color: cores.cinza, fontSize: 13, textAlign: 'center', marginTop: 24 },
});
