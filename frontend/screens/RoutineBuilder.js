import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'

export default function IngredientChecker({ navigation }) {
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.back}>← back</Text>
      </TouchableOpacity>
      <Text style={styles.emoji}>🌿</Text>
      <Text style={styles.title}>my routine</Text>
      <Text style={styles.sub}>coming soon 🪷</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF5F7', padding: 24, paddingTop: 60 },
  back: { color: '#C9A99A', fontSize: 14, marginBottom: 40 },
  emoji: { fontSize: 60, textAlign: 'center', marginBottom: 16 },
  title: { fontSize: 28, color: '#5C3D35', fontStyle: 'italic', textAlign: 'center', marginBottom: 8 },
  sub: { fontSize: 14, color: '#C9A99A', textAlign: 'center' },
})