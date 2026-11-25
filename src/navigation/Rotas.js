import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from '../screens/LoginScreen';
import CadastroScreen from '../screens/CadastroScreen';
import EsqueceuSenhaScreen from '../screens/EsqueceuSenhaScreen';
import SystemDesignScreen from '../screens/SystemDesignScreen';
import BuscaProdutosScreen from '../screens/BuscaProdutosScreen';
import FormularioProdutoScreen from '../screens/FormularioProdutoScreen';
import AbasPrincipais from './AbasPrincipais';
import CategoriaScreen from '../screens/CategoriaScreen';
import ProdutoScreen from '../screens/ProdutoScreen';
import CompararScreen from '../screens/CompararScreen';
import { cores } from '../theme/cores';

const Pilha = createNativeStackNavigator();

export default function Rotas() {
  return (
    <NavigationContainer>
      <Pilha.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerStyle: { backgroundColor: cores.branco },
          headerTintColor: cores.grafite,
          headerTitleStyle: { fontWeight: '700' },
          headerShadowVisible: false,
        }}
      >
        <Pilha.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Pilha.Screen name="Cadastro" component={CadastroScreen} options={{ headerShown: false }} />
        <Pilha.Screen name="EsqueceuSenha" component={EsqueceuSenhaScreen} options={{ headerShown: false }} />
        <Pilha.Screen name="SystemDesign" component={SystemDesignScreen} options={{ title: 'System Design' }} />
        <Pilha.Screen name="BuscaProdutos" component={BuscaProdutosScreen} options={{ title: 'Pesquisa de produtos' }} />
        <Pilha.Screen name="FormularioProduto" component={FormularioProdutoScreen} options={{ title: 'Produto' }} />

        <Pilha.Screen name="Abas" component={AbasPrincipais} options={{ headerShown: false }} />

        <Pilha.Screen
          name="Categoria"
          component={CategoriaScreen}
          options={({ route }) => ({ title: route.params.nome })}
        />
        <Pilha.Screen name="Produto" component={ProdutoScreen} options={{ title: 'Detalhes' }} />
        <Pilha.Screen name="Comparar" component={CompararScreen} options={{ title: 'Comparar' }} />
      </Pilha.Navigator>
    </NavigationContainer>
  );
}
