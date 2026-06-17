import { useState } from 'react'
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native'
import Markdown from 'react-native-markdown-display'

export default function ProductFinder({navigation}) {
  // 3 pieces of state
  const [query, setQuery] = useState('') // what user typed
  const [response, setResponse] = useState('') // API answer
  const [loading, setLoading] = useState(false) // is it loading

  // searching for products take time, so use async to tell JS that it needs to wait here until fxn returns
  const searchProducts = async() => {
    setLoading(true)

    // fetch sends HTTP resuqest to FastAPI server
    // await waits for the server to respond before moving on
    // method: 'POST' = we r sending data too not just fetching
    const res = await fetch("https://recreate-thing-champion.ngrok-free.dev/products/find", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json'},
      body: JSON.stringify({ query: query })
    })
    
    const data = await res.json()
    setResponse(data.response)
    
    setLoading(false)
  }

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity 
        onPress={() => navigation.goBack()}
        style={styles.backButton}
      >
        <Text style={styles.backText}>← back</Text>
      </TouchableOpacity>
      <Text style={styles.title}>glowrithm 🪷</Text>
      <Text style={styles.tagline}>your pocket beauty bestie</Text>
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={query}
          onChangeText={setQuery}
          placeholder="enter your query here!"
          placeholderTextColor="#C9A99A"
        />
        {loading 
          ? <ActivityIndicator size="large" color="#F4A7B9" />
          : <TouchableOpacity style={styles.button} onPress={searchProducts}>
              <Text style={styles.buttonText}>search</Text>
            </TouchableOpacity>
        }
      </View>
      {response ? 
      <View style={styles.responseCard}>
        <TouchableOpacity style={styles.clearX} onPress={() => {
          setResponse('')
          setQuery('')
        }}>
          <Text style={styles.clearXText}>✕</Text>
        </TouchableOpacity>
        <Markdown>{response}</Markdown> 
      </View>
    : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF5F7',
    padding: 24,
    paddingTop: 60,
  },
  title: {
    fontSize: 32,
    color: '#5C3D35',
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 13,
    color: '#C9A99A',
    textAlign: 'center',
    marginBottom: 32,
    letterSpacing: 1,
  },
  button: {
    backgroundColor: '#7D5A52',
    borderRadius: 50,
    padding: 14,
    alignItems: 'center',
    alignSelf:'center',
  },
  buttonText: {
    color: '#FFF5F7',
    fontStyle: 'italic',
    letterSpacing: 1,
  },
  response: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F4D5C8',
    color: '#5C3D35',
    lineHeight: 22,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
  },
  input: {
    flex: 1,  // takes up remaining space, button stays fixed width
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#F9D5E0',
    color: '#5C3D35',
  },
  responseCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F4D5C8',
  },
  clearX: {
  alignSelf: 'flex-end',
  marginBottom: 8,
  },
  clearXText: {
    color: '#C9A99A',
    fontSize: 16,
  },
  backButton: {
    marginBottom: 16,
  },
  backText: {
    color: '#C9A99A',
    fontSize: 14,
  },
})