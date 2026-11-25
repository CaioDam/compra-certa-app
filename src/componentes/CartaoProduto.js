import { Image, Text, StyleSheet, TouchableOpacity, View } from 'react-native';
import { cores } from '../theme/cores';

export default function CartaoProduto({
  produto,
  aoPressionar,
  aoFavoritar,
  aoAlternarLista,
  aoEditar,
  aoExcluir,
}) {
  return (
    <View style={estilos.cartao}>
      <View style={estilos.informacoes}>
        {produto.image ? (
          <Image source={{ uri: produto.image }} style={estilos.imagem} resizeMode="cover" />
        ) : (
          <View style={estilos.semImagem}><Text style={estilos.textoSemImagem}>Sem imagem</Text></View>
        )}
        <TouchableOpacity style={estilos.detalhes} onPress={aoPressionar} activeOpacity={0.75}>
          <Text style={estilos.nome}>{produto.name}</Text>
          {produto.category ? <Text style={estilos.categoria}>{produto.category}</Text> : null}
          {produto.description ? <Text style={estilos.descricao}>{produto.description}</Text> : null}
        </TouchableOpacity>
      </View>

      <View style={estilos.acoes}>
        {aoFavoritar ? (
          <Text style={estilos.acao} onPress={aoFavoritar}>
            {produto.is_favorite ? 'Remover favorito' : 'Favoritar'}
          </Text>
        ) : null}
        {aoAlternarLista ? (
          <Text style={estilos.acao} onPress={aoAlternarLista}>
            {produto.in_shopping_list ? 'Remover da lista' : 'Adicionar à lista'}
          </Text>
        ) : null}
        {aoEditar ? <Text style={estilos.acao} onPress={aoEditar}>Editar</Text> : null}
        {aoExcluir ? <Text style={estilos.acaoExcluir} onPress={aoExcluir}>Excluir</Text> : null}
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  cartao: { backgroundColor: cores.branco, borderRadius: 12, padding: 14, marginBottom: 10 },
  informacoes: { flexDirection: 'row', alignItems: 'center' },
  imagem: { width: 72, height: 72, borderRadius: 8, marginRight: 12 },
  semImagem: {
    width: 72,
    height: 72,
    borderRadius: 8,
    backgroundColor: cores.fundo,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textoSemImagem: { color: cores.cinza, fontSize: 9, textAlign: 'center' },
  detalhes: { flex: 1 },
  nome: { color: cores.grafite, fontSize: 15, fontWeight: '700' },
  categoria: { color: cores.verdeEscuro, fontSize: 12, marginTop: 4 },
  descricao: { color: cores.cinza, fontSize: 13, lineHeight: 18, marginTop: 6 },
  acoes: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 10 },
  acao: { color: cores.verdeEscuro, fontSize: 12, fontWeight: '700', marginRight: 16, marginTop: 6 },
  acaoExcluir: { color: cores.vermelho, fontSize: 12, fontWeight: '700', marginTop: 6 },
});
