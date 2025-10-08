import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Text, Alert } from 'react-native';

import {
  Provider as PaperProvider,
  TextInput,
  Button,
  Appbar,
  Card,
  FAB,
  Title,
  Paragraph,
  DefaultTheme,
} from 'react-native-paper';

import { NavigationContainer, useIsFocused } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import { createClient } from '@supabase/supabase-js';

const temaAmarelo = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#facc15',
    accent: '#fde047',
    background: '#fefce8',
  },
};

const supabaseUrl = 'https://wsfuevzalkmlgywtlluo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndzZnVldnphbGttbGd5d3RsbHVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4Nzc3NjcsImV4cCI6MjA3NTQ1Mzc2N30.Uz1palXzXVgUuq5heY69srFagXQoA1Tbfb9YSXCjt58';
const supabase = createClient(supabaseUrl, supabaseKey);

const Stack = createStackNavigator();

function TelaLista({ navigation }) {
  const [produtos, setProdutos] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const telaEstaFocada = useIsFocused();

  useEffect(() => {
    if (telaEstaFocada) {
      buscarProdutos();
    }
  }, [telaEstaFocada]);

  async function buscarProdutos() {
    setCarregando(true);
    const { data, error } = await supabase
      .from('produtos')
      .select('*');

    if (error) {
      Alert.alert('Erro ao buscar produtos', error.message);
    } else {
      setProdutos(data);
    }
    setCarregando(false);
  }

  return (
    <View style={estilos.container}>
      <FlatList
        data={produtos}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <Card style={estilos.card}>
            <Card.Content>
              <Title>{item.nome_produto}</Title>
              <Paragraph>Categoria: {item.categoria}</Paragraph>
              <Paragraph>Quantidade: {item.quantidade}</Paragraph>
              <Paragraph>Vencimento: {new Date(item.vencimento).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</Paragraph>
            </Card.Content>
          </Card>
        )}
        ListEmptyComponent={() => (
          <View style={estilos.listaVazia}>
            <Text>Nenhum produto cadastrado ainda.</Text>
          </View>
        )}
      />
      <FAB
        style={estilos.fab}
        icon="plus"
        onPress={() => navigation.navigate('AdicionarProduto')}
      />
    </View>
  );
}

function TelaAdicionar({ navigation }) {
  const [nomeProduto, setNomeProduto] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [vencimento, setVencimento] = useState('');
  const [categoria, setCategoria] = useState('');
  const [salvando, setSalvando] = useState(false);

  async function handleSalvarProduto() {
    if (!nomeProduto || !quantidade || !vencimento || !categoria) {
      Alert.alert('Atenção', 'Por favor, preencha todos os campos.');
      return;
    }

    setSalvando(true);
    const { data, error } = await supabase
      .from('produtos')
      .insert([
        { 
          nome_produto: nomeProduto, 
          quantidade: parseInt(quantidade),
          vencimento: vencimento,
          categoria: categoria 
        },
      ]);
    
    setSalvando(false);

    if (error) {
      Alert.alert('Erro ao salvar', error.message);
    } else {
      navigation.goBack();
    }
  }

  return (
    <View style={estilos.containerForm}>
      <TextInput
        label="Nome do Produto"
        value={nomeProduto}
        onChangeText={setNomeProduto}
        style={estilos.input}
      />
      <TextInput
        label="Quantidade"
        value={quantidade}
        onChangeText={setQuantidade}
        keyboardType="numeric"
        style={estilos.input}
      />
      <TextInput
        label="Vencimento (AAAA-MM-DD)"
        value={vencimento}
        onChangeText={setVencimento}
        placeholder="Ex: 2025-10-25"
        style={estilos.input}
      />
      <TextInput
        label="Categoria"
        value={categoria}
        onChangeText={setCategoria}
        style={estilos.input}
      />
      <Button 
        mode="contained" 
        onPress={handleSalvarProduto}
        style={estilos.botao}
        loading={salvando}
        disabled={salvando}
      >
        Salvar Produto
      </Button>
    </View>
  );
}

export default function App() {
  return (
    <PaperProvider theme={temaAmarelo}>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="ListaProdutos"
          screenOptions={{
            header: (props) => (
              <Appbar.Header>
                {props.back ? <Appbar.BackAction onPress={props.navigation.goBack} /> : null}
                <Appbar.Content title={props.options.title} />
              </Appbar.Header>
            ),
          }}
        >
          <Stack.Screen
            name="ListaProdutos"
            component={TelaLista}
            options={{ title: 'Cltr PDV - Seu controle do ponto de venda' }}
          />
          <Stack.Screen
            name="AdicionarProduto"
            component={TelaAdicionar}
            options={{ title: 'Adicionar Produto' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}

const estilos = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fefce8',
  },
  containerForm: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fefce8',
  },
  card: {
    margin: 8,
    backgroundColor: '#fef9c3',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  input: {
    marginBottom: 12,
  },
  botao: {
    marginTop: 8,
    padding: 8,
  },
  listaVazia: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  }
});



