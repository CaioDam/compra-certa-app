import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import HomeScreen from '../screens/HomeScreen';
import ListaComprasScreen from '../screens/ListaComprasScreen';
import FavoritosScreen from '../screens/FavoritosScreen';
import PerfilScreen from '../screens/PerfilScreen';
import IconeBootstrap from '../componentes/IconeBootstrap';
import { cores } from '../theme/cores';

const Abas = createBottomTabNavigator();

export default function AbasPrincipais() {
  return (
    <Abas.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: cores.verde,
        tabBarInactiveTintColor: cores.cinza,
        tabBarStyle: { height: 58, paddingBottom: 8, paddingTop: 6 },
      }}
    >
      <Abas.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'Início',
          tabBarIcon: ({ color }) => <IconeBootstrap nome="casa" tamanho={18} cor={color} />,
        }}
      />
      <Abas.Screen
        name="Lista"
        component={ListaComprasScreen}
        options={{
          title: 'Lista',
          tabBarIcon: ({ color }) => <IconeBootstrap nome="cesta" tamanho={18} cor={color} />,
        }}
      />
      <Abas.Screen
        name="Favoritos"
        component={FavoritosScreen}
        options={{
          title: 'Favoritos',
          tabBarIcon: ({ color }) => <IconeBootstrap nome="estrela" tamanho={18} cor={color} />,
        }}
      />
      <Abas.Screen
        name="Perfil"
        component={PerfilScreen}
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color }) => <IconeBootstrap nome="pessoa" tamanho={18} cor={color} />,
        }}
      />
    </Abas.Navigator>
  );
}
