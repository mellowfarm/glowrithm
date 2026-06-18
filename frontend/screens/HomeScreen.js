import { useState } from 'react'
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Dimensions } from 'react-native'

const { width } = Dimensions.get('window')  // gets screen width
const CARD_SIZE = (width - 60) / 2  // card is half screen width minus padding

const features = [
  { id: 'ingredient', label: 'ingredient\nchecker', emoji: '🔬', screen: 'Ingredient' },
  { id: 'product', label: 'product\nfinder', emoji: '🧴', screen: 'ProductFinder' },
  { id: 'routine', label: 'my\nroutine', emoji: '🌿', screen: 'Routine' },
  { id: 'stash', label: 'my\nstash', emoji: '🫧', screen: 'Stash' },
]

export default function HomeScreen({ navigation }) {
  return (
    <ScrollView 
    style={styles.container}
    contentContainerStyle={styles.content}>
        <Text style={styles.title}>glowrithm 🪷</Text>
        <Text style={styles.tagline}>your pocket beauty bestie</Text>
        <View style={styles.grid}>
        {features.map((feature) => (
            <TouchableOpacity
                key={feature.id}
                style={styles.card}
                onPress={() => navigation.navigate(feature.screen)}
            >
            <Text style={styles.cardEmoji}>{feature.emoji}</Text>
            <Text style={styles.cardLabel}>{feature.label}</Text>
            </TouchableOpacity>
        ))}
        </View>
    </ScrollView>
    )
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: CARD_SIZE * 2 + 16,
  },
  card: {
    width: CARD_SIZE,
    height: CARD_SIZE,
    backgroundColor: '#7D5A52',
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    marginBottom: 16,
    marginRight: 8,
  },
  cardLabel: {
    color: '#FFF5F7',
    fontSize: 15,
    textAlign: 'center',
    fontStyle: 'italic',
    letterSpacing: 0.5,
  },
  cardEmoji: {
    fontSize: 40,
    marginBottom: 10,
  },
   content: {
    alignItems: 'center',
    paddingBottom: 40,
  },
})