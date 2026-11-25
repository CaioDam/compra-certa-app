import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { cores } from '../theme/cores';

const fluxoPrincipal = [
  {
    titulo: 'Aplicativo mobile',
    tecnologia: 'React Native + Expo',
    descricao: 'Telas de busca de produtos, login, perfil e navegação do Compra Certa.',
  },
  {
    titulo: 'Camada de API',
    tecnologia: 'Django REST Framework',
    descricao: 'Valida entradas, aplica permissões e coordena as operações do app.',
  },
];

const integracoes = [
  {
    titulo: 'Orientação sobre produtos',
    tecnologia: 'Gemini · nível gratuito',
    descricao: 'A API pede orientações gerais ao modelo, sem pesquisa de lojas ou preços atuais.',
  },
  {
    titulo: 'Contas e persistência',
    tecnologia: 'SQLite no desenvolvimento',
    descricao: 'O backend armazena contas e produtos por usuário; senhas ficam protegidas por hash.',
  },
];

const etapas = [
  ['1', 'Cadastro ou login', 'O cadastro também registra o aceite do aviso de privacidade.'],
  ['2', 'Validação', 'O Django valida os dados e confere a senha usando o hash armazenado.'],
  ['3', 'Sessão', 'A API devolve um token; o app o envia nas próximas chamadas autenticadas.'],
  ['4', 'Dados da conta', 'A pessoa gerencia apenas seus produtos, favoritos e lista de compras.'],
];

const paleta = [
  { nome: 'Verde principal', valor: cores.verde },
  { nome: 'Verde escuro', valor: cores.verdeEscuro },
  { nome: 'Grafite', valor: cores.grafite },
  { nome: 'Fundo', valor: cores.fundo },
  { nome: 'Branco', valor: cores.branco },
  { nome: 'Cinza', valor: cores.cinza },
  { nome: 'Cinza claro', valor: cores.cinzaClaro },
  { nome: 'Vermelho', valor: cores.vermelho },
  { nome: 'Amarelo', valor: cores.amarelo },
];

function CartaoComponente({ titulo, tecnologia, descricao }) {
  return (
    <View style={estilos.cartao}>
      <Text style={estilos.cartaoTitulo}>{titulo}</Text>
      <Text style={estilos.tecnologia}>{tecnologia}</Text>
      <Text style={estilos.descricao}>{descricao}</Text>
    </View>
  );
}

export default function SystemDesignScreen() {
  return (
    <ScrollView style={estilos.tela} contentContainerStyle={estilos.conteudo}>
      <View style={estilos.cabecalho}>
        <Text style={estilos.sobretitulo}>COMPRA CERTA · ARQUITETURA</Text>
        <Text style={estilos.titulo}>System Design</Text>
        <Text style={estilos.introducao}>
          Visão geral dos componentes, limites de responsabilidade e fluxo de autenticação do app.
        </Text>
      </View>

      <Text style={estilos.secaoTitulo}>Visão de alto nível</Text>
      {fluxoPrincipal.map((componente, indice) => (
        <View key={componente.titulo}>
          <CartaoComponente {...componente} />
          {indice < fluxoPrincipal.length - 1 ? <Text style={estilos.conector}>↓</Text> : null}
        </View>
      ))}
      <Text style={estilos.integracoesRotulo}>A API conecta-se a:</Text>
      {integracoes.map((componente) => (
        <View key={componente.titulo} style={estilos.integracao}>
          <CartaoComponente {...componente} />
        </View>
      ))}

      <Text style={estilos.secaoTitulo}>Paleta de cores</Text>
      <View style={estilos.paleta}>
        {paleta.map((cor) => (
          <View key={cor.nome} style={estilos.cor}>
            <View style={[estilos.amostra, { backgroundColor: cor.valor }]} />
            <Text style={estilos.nomeCor}>{cor.nome}</Text>
            <Text style={estilos.codigoCor}>{cor.valor}</Text>
          </View>
        ))}
      </View>

      <Text style={estilos.secaoTitulo}>Fluxo de autenticação</Text>
      <View style={estilos.cartaoFluxo}>
        {etapas.map(([numero, titulo, descricao], indice) => (
          <View key={numero} style={estilos.etapa}>
            <View style={estilos.numero}><Text style={estilos.numeroTexto}>{numero}</Text></View>
            <View style={estilos.etapaConteudo}>
              <Text style={estilos.etapaTitulo}>{titulo}</Text>
              <Text style={estilos.descricao}>{descricao}</Text>
            </View>
            {indice < etapas.length - 1 ? <View style={estilos.linha} /> : null}
          </View>
        ))}
      </View>

      <Text style={estilos.secaoTitulo}>Responsabilidades da API</Text>
      <View style={estilos.cartao}>
        <Text style={estilos.item}>• Chave do Gemini mantida no backend; chamadas sem busca web.</Text>
        <Text style={estilos.item}>• Autenticação por token e endpoints protegidos.</Text>
        <Text style={estilos.item}>• Produtos e favoritos separados por usuário autenticado.</Text>
        <Text style={estilos.item}>• Excluir a conta também remove os produtos associados.</Text>
        <Text style={estilos.item}>• O backend registra a data e a versão do aceite de privacidade.</Text>
        <Text style={estilos.item}>• Recuperação demonstrativa com token temporário do Django.</Text>
        <Text style={estilos.item}>• Banco SQLite local; pode ser substituído por PostgreSQL em produção.</Text>
      </View>

    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  conteudo: { padding: 20, paddingBottom: 36 },
  cabecalho: { marginBottom: 24 },
  sobretitulo: { color: cores.verdeEscuro, fontSize: 11, fontWeight: '800', letterSpacing: 1.2 },
  titulo: { color: cores.grafite, fontSize: 28, fontWeight: '800', marginTop: 6 },
  introducao: { color: cores.cinza, fontSize: 14, lineHeight: 21, marginTop: 8 },
  secaoTitulo: { color: cores.grafite, fontSize: 17, fontWeight: '700', marginTop: 8, marginBottom: 12 },
  cartao: { backgroundColor: cores.branco, borderRadius: 14, padding: 16 },
  cartaoTitulo: { color: cores.grafite, fontSize: 16, fontWeight: '700' },
  tecnologia: { color: cores.verdeEscuro, fontSize: 13, fontWeight: '600', marginTop: 4 },
  descricao: { color: cores.cinza, fontSize: 13, lineHeight: 19, marginTop: 8 },
  conector: { color: cores.verde, fontSize: 20, fontWeight: '700', textAlign: 'center', height: 34, textAlignVertical: 'center' },
  integracoesRotulo: { color: cores.cinza, fontSize: 13, fontWeight: '600', marginTop: 16, marginBottom: 8 },
  integracao: { marginBottom: 10 },
  paleta: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 16 },
  cor: { width: '31%', backgroundColor: cores.branco, borderRadius: 10, padding: 10, marginBottom: 8 },
  amostra: { height: 34, borderRadius: 6, borderWidth: 1, borderColor: cores.cinzaClaro, marginBottom: 7 },
  nomeCor: { color: cores.grafite, fontSize: 11, fontWeight: '700' },
  codigoCor: { color: cores.cinza, fontSize: 10, marginTop: 2 },
  cartaoFluxo: { backgroundColor: cores.branco, borderRadius: 14, padding: 16 },
  etapa: { flexDirection: 'row', position: 'relative', paddingBottom: 18 },
  numero: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: cores.verde,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  numeroTexto: { color: cores.branco, fontSize: 13, fontWeight: '700' },
  etapaConteudo: { flex: 1, paddingBottom: 4 },
  etapaTitulo: { color: cores.grafite, fontSize: 14, fontWeight: '700' },
  linha: { position: 'absolute', top: 28, bottom: 0, left: 13, width: 2, backgroundColor: cores.cinzaClaro },
  item: { color: cores.grafite, fontSize: 13, lineHeight: 20, marginBottom: 8 },
});
