import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import IconeBootstrap from './IconeBootstrap';
import { cores } from '../theme/cores';

export default function Botao({ texto, aoPressionar, variante = 'primario', carregando = false, icone }) {
  const ehPrimario = variante === 'primario';

  return (
    <TouchableOpacity
      style={[estilos.botao, ehPrimario ? estilos.primario : estilos.secundario]}
      onPress={aoPressionar}
      activeOpacity={0.8}
      disabled={carregando}
    >
      {carregando ? (
        <ActivityIndicator color={ehPrimario ? cores.branco : cores.verde} />
      ) : (
        <View style={estilos.conteudo}>
          {icone ? <IconeBootstrap nome={icone} tamanho={18} cor={ehPrimario ? cores.branco : cores.verde} style={estilos.icone} /> : null}
          <Text style={ehPrimario ? estilos.textoPrimario : estilos.textoSecundario}>{texto}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const estilos = StyleSheet.create({
  botao: {
    height: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  conteudo: { flexDirection: 'row', alignItems: 'center' },
  icone: { marginRight: 8 },
  primario: {
    backgroundColor: cores.verde,
  },
  secundario: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: cores.verde,
  },
  textoPrimario: {
    color: cores.branco,
    fontSize: 16,
    fontWeight: '700',
  },
  textoSecundario: {
    color: cores.verde,
    fontSize: 16,
    fontWeight: '700',
  },
});
