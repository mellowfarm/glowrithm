import { useState } from 'react'
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import Markdown from 'react-native-markdown-display'

export default function IngredientChecker({ navigation }) {
    // state
    const [loading, setLoading] = useState(false)
    const [ingredients, setIngredients] = useState('')
    const [analysis, setAnalysis] = useState('')

    // analyse fxn -> calls backend
    const analyseIngredients = async (base64Image) => {
        setLoading(true)
        const res = await fetch('https://recreate-thing-champion.ngrok-free.dev/ingredients/check', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({image: base64Image})
        })
        const data = await res.json()
        setIngredients(data.ingredients)
        setAnalysis(data.analysis)
        setLoading(false)
    }
    
    const pickImage = async () => {
        // request camera permission first
        const { status } = await ImagePicker.requestCameraPermissionsAsync()
        
        if (status !== 'granted') {
            alert('we need camera permission to scan ingredients! 🪷')
            return
        }

        // open camera
        const result = await ImagePicker.launchCameraAsync({
            base64: true,        // we need base64 to send to backend
            quality: 0.7,        // compress a bit to save tokens
        })

        if (!result.canceled) {
            const base64Image = result.assets[0].base64
            // send to backend
            await analyseIngredients(base64Image)
        }
    }
  
    return (
        <ScrollView style={styles.container}>
        {/* back button */}
        <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.back}>← back</Text>
        </TouchableOpacity>

        {/* title */}
        <Text style={styles.title}>ingredient checker 🔬</Text>
        <Text style={styles.sub}>scan your product's ingredient list</Text>

        {/* camera button */}
        {loading
            ? <ActivityIndicator size="large" color="#F4A7B9" style={{ marginTop: 40 }} />
            : <TouchableOpacity style={styles.cameraButton} onPress={pickImage}>
                <Text style={styles.cameraEmoji}>📷</Text>
                <Text style={styles.cameraText}>scan ingredients</Text>
            </TouchableOpacity>
        }

        {/* results */}
        {analysis ?
            <View style={styles.responseCard}>
            <TouchableOpacity style={styles.clearX} onPress={() => {
                setAnalysis('')
                setIngredients('')
            }}>
                <Text style={styles.clearXText}>✕</Text>
            </TouchableOpacity>
            <Markdown>{analysis}</Markdown>
            </View>
        : null}
        </ScrollView>
    )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF5F7', padding: 24, paddingTop: 60 },
  back: { color: '#C9A99A', fontSize: 14, marginBottom: 40 },
  title: { fontSize: 28, color: '#5C3D35', fontStyle: 'italic', textAlign: 'center', marginBottom: 8 },
  sub: { fontSize: 13, color: '#C9A99A', textAlign: 'center', marginBottom: 40, letterSpacing: 1 },
  cameraButton: {
    backgroundColor: '#7D5A52',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 40,
    gap: 12,
  },
  cameraText: {
    color: '#FFF5F7',
    fontStyle: 'italic',
    fontSize: 16,
    letterSpacing: 1,
  },
  cameraEmoji: {
    fontSize: 48,
    marginBottom: 4,
  },
  responseCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginTop: 24,
    borderWidth: 1,
    borderColor: '#F4D5C8',
  },
  clearX: { alignSelf: 'flex-end', marginBottom: 8 },
  clearXText: { color: '#C9A99A', fontSize: 16 },
})
