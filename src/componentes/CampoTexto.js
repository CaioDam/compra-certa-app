import { View, Text, TextInput, StyleSheet } from 'react-native';
import { cores } from '../theme/cores';

export default function CampoTexto({
  label,
  valor,
  aoMudar,
  erro,
  placeholder,
  senha = false,
  tipoTeclado = 'default',
}) {
  return (
    <View style={estilos.container}>
      <Text style={estilos.label}>{label}</Text>
      <TextInput
        style={[estilos.input, erro ? estilos.inputComErro : null]}
        value={valor}
        onChangeText={aoMudar}
        placeholder={placeholder}
        placeholderTextColor={cores.cinza}
        secureTextEntry={senha}
        keyboardType={tipoTeclado}
        autoCapitalize="none"
      />
      {erro ? <Text style={estilos.textoErro}>{erro}</Text> : null}
    </View>
  );
}

const estilos = StyleSheet.create({
  container: {
    marginBottom: 14,
  },
  label: {
    fontSize: 13,
    color: cores.grafite,
    marginBottom: 6,
    fontWeight: '600',
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: cores.cinzaClaro,
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 15,
    backgroundColor: cores.branco,
    color: cores.grafite,
  },
  inputComErro: {
    borderColor: cores.vermelho,
  },
  textoErro: {
    color: cores.vermelho,
    fontSize: 12,
    marginTop: 4,
  },
});
