import { Platform } from 'react-native';

const API_URL = (process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:8000/api').replace(/\/$/, '');

let token = null;

async function requisitar(caminho, opcoes = {}) {
  const ehFormulario = typeof FormData !== 'undefined' && opcoes.body instanceof FormData;
  const cabecalhos = {
    Accept: 'application/json',
    ...(ehFormulario ? {} : { 'Content-Type': 'application/json' }),
    ...opcoes.headers,
  };

  if (token) {
    cabecalhos.Authorization = `Token ${token}`;
  }

  const resposta = await fetch(`${API_URL}${caminho}`, {
    ...opcoes,
    headers: cabecalhos,
  });
  const texto = await resposta.text();
  const dados = texto ? JSON.parse(texto) : null;

  if (!resposta.ok) {
    const mensagem = dados && typeof dados === 'object'
      ? Object.values(dados).flat().join('\n')
      : 'Não foi possível concluir a solicitação.';
    throw new Error(mensagem || 'Não foi possível concluir a solicitação.');
  }

  return dados;
}

async function criarFormularioProduto(produto, imagem) {
  const formulario = new FormData();
  Object.entries(produto).forEach(([campo, valor]) => formulario.append(campo, String(valor)));

  if (imagem) {
    const extensao = imagem.mimeType === 'image/png' ? 'png' : 'jpg';
    const nomeArquivo = imagem.fileName || `produto.${extensao}`;
    if (Platform.OS === 'web') {
      const resposta = await fetch(imagem.uri);
      const arquivo = await resposta.blob();
      formulario.append('image', arquivo, nomeArquivo);
    } else {
      formulario.append('image', {
        uri: imagem.uri,
        name: nomeArquivo,
        type: imagem.mimeType || 'image/jpeg',
      });
    }
  }

  return formulario;
}

export const api = {
  async cadastrar({ nome, email, senha, aceitouPrivacidade }) {
    const dados = await requisitar('/auth/register/', {
      method: 'POST',
      body: JSON.stringify({
        name: nome,
        email,
        password: senha,
        privacy_accepted: aceitouPrivacidade,
      }),
    });
    token = dados.token;
    return dados.user;
  },

  async entrar(email, senha) {
    const dados = await requisitar('/auth/login/', {
      method: 'POST',
      body: JSON.stringify({ email, password: senha }),
    });
    token = dados.token;
    return dados.user;
  },

  async sair() {
    await requisitar('/auth/logout/', { method: 'POST' });
    token = null;
  },

  obterConta() {
    return requisitar('/account/');
  },

  atualizarConta({ nome, email }) {
    return requisitar('/account/', {
      method: 'PATCH',
      body: JSON.stringify({ name: nome, email }),
    });
  },

  async excluirConta() {
    await requisitar('/account/', { method: 'DELETE' });
    token = null;
  },

  solicitarRedefinicao(email) {
    return requisitar('/auth/password-reset/request/', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  redefinirSenha({ email, token: tokenRedefinicao, senha }) {
    return requisitar('/auth/password-reset/confirm/', {
      method: 'POST',
      body: JSON.stringify({ email, token: tokenRedefinicao, password: senha }),
    });
  },

  buscarProdutos(query) {
    return requisitar('/products/search/', {
      method: 'POST',
      body: JSON.stringify({ query }),
    });
  },

  listarCategorias() {
    return requisitar('/products/categories/');
  },

  listarProdutos() {
    return requisitar('/products/');
  },

  listarProdutosPorCategoria(categoria) {
    return requisitar(`/products/?category=${encodeURIComponent(categoria)}`);
  },

  listarFavoritos() {
    return requisitar('/products/favorites/');
  },

  listarProdutosDaLista() {
    return requisitar('/products/shopping-list/');
  },

  obterProduto(id) {
    return requisitar(`/products/${id}/`);
  },

  async criarProduto(produto, imagem) {
    const body = imagem
      ? await criarFormularioProduto(produto, imagem)
      : JSON.stringify(produto);
    return requisitar('/products/', {
      method: 'POST',
      body,
    });
  },

  async atualizarProduto(id, produto, imagem) {
    const body = imagem
      ? await criarFormularioProduto(produto, imagem)
      : JSON.stringify(produto);
    return requisitar(`/products/${id}/`, {
      method: 'PATCH',
      body,
    });
  },

  excluirProduto(id) {
    return requisitar(`/products/${id}/`, { method: 'DELETE' });
  },
};
