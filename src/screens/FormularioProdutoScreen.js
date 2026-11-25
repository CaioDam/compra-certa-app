import { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Botao from '../componentes/Botao';
import CampoTexto from '../componentes/CampoTexto';
import { api } from '../servicos/api';
import { cores } from '../theme/cores';

export default function FormularioProdutoScreen({ route, navigation }) {
  const produto = route.params?.produto;
  const [nome, setNome] = useState(produto?.name || '');
  const [categoria, setCategoria] = useState(produto?.category || '');
  const [descricao, setDescricao] = useState(produto?.description || '');
  const [categorias, setCategorias] = useState([]);
  const [imagem, setImagem] = useState(null);
  const [imagemUri, setImagemUri] = useState(produto?.image || '');
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    api.listarCategorias()
      .then(setCategorias)
      .catch((erroApi) => setErro(erroApi.message));
  }, []);

  async function escolherImagem() {
    try {
      const permissao = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissao.granted) {
        setErro('Permita o acesso à galeria para escolher uma imagem.');
        return;
      }

      const resultado = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!resultado.canceled) {
        const arquivo = resultado.assets[0];
        if (arquivo.fileSize && arquivo.fileSize > 5 * 1024 * 1024) {
          setErro('A imagem deve ter no máximo 5 MB.');
          return;
        }
        setImagem(arquivo);
        setImagemUri(arquivo.uri);
        setErro('');
      }
    } catch (erroImagem) {
      setErro(erroImagem.message);
    }
  }

  async function salvar() {
    if (!nome.trim()) {
      setErro('Informe o nome do produto.');
      return;
    }
    if (!categoria) {
      setErro('Escolha uma categoria.');
      return;
    }

    setSalvando(true);
    setErro('');
    const dados = {
      name: nome.trim(),
      category: categoria.trim(),
      description: descricao.trim(),
    };

    try {
      if (produto) {
        await api.atualizarProduto(produto.id, dados, imagem);
      } else {
        await api.criarProduto(dados, imagem);
      }
      navigation.goBack();
    } catch (erroApi) {
      setErro(erroApi.message);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <ScrollView style={estilos.tela} contentContainerStyle={estilos.conteudo}>
      <Text style={estilos.titulo}>{produto ? 'Editar produto' : 'Cadastrar produto'}</Text>
      <CampoTexto label="Nome" valor={nome} aoMudar={setNome} placeholder="Nome do produto" />
      <Text style={estilos.rotulo}>Categoria</Text>
      <View style={estilos.listaCategorias}>
        {categorias.map((opcao) => (
          <TouchableOpacity
            key={opcao}
            style={[estilos.categoria, categoria === opcao && estilos.categoriaSelecionada]}
            onPress={() => setCategoria(opcao)}
          >
            <Text style={[estilos.textoCategoria, categoria === opcao && estilos.textoSelecionado]}>
              {opcao}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <CampoTexto
        label="Descrição"
        valor={descricao}
        aoMudar={setDescricao}
        placeholder="Detalhes que você queira guardar"
      />
      <Botao
        texto={imagemUri ? 'Trocar imagem' : 'Adicionar imagem'}
        variante="secundario"
        aoPressionar={escolherImagem}
      />
      {imagemUri ? (
        <Image source={{ uri: imagemUri }} style={estilos.imagem} resizeMode="cover" />
      ) : (
        <View style={estilos.semImagem}>
          <Text style={estilos.textoSemImagem}>Nenhuma imagem selecionada</Text>
        </View>
      )}
      {erro ? <Text style={estilos.erro}>{erro}</Text> : null}
      <Botao texto="Salvar" aoPressionar={salvar} carregando={salvando} />
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  conteudo: { padding: 20 },
  titulo: { color: cores.grafite, fontSize: 20, fontWeight: '800', marginBottom: 20 },
  rotulo: { color: cores.grafite, fontSize: 13, fontWeight: '600', marginBottom: 8 },
  listaCategorias: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 14 },
  categoria: {
    backgroundColor: cores.branco,
    borderWidth: 1,
    borderColor: cores.cinzaClaro,
    borderRadius: 18,
    marginRight: 7,
    marginBottom: 7,
    paddingHorizontal: 11,
    paddingVertical: 7,
  },
  categoriaSelecionada: { backgroundColor: cores.verde, borderColor: cores.verde },
  textoCategoria: { color: cores.grafite, fontSize: 12 },
  textoSelecionado: { color: cores.branco, fontWeight: '700' },
  imagem: { width: '100%', height: 190, borderRadius: 12, marginTop: 12, marginBottom: 12 },
  semImagem: {
    height: 90,
    backgroundColor: cores.branco,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    marginBottom: 12,
  },
  textoSemImagem: { color: cores.cinza, fontSize: 12 },
  erro: { color: cores.vermelho, fontSize: 13, marginBottom: 10 },
});
