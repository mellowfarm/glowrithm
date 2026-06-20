import { Alert, StyleSheet, Text, TextInput, Image, View, FlatList, Modal, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native'
import { useState, useEffect } from 'react'
import * as ImagePicker from 'expo-image-picker'
import { supabase } from '../lib/supabase'


const SKINCARE_CATEGORIES = ['cleanser', 'toner', 'essence', 'serum', 'eye cream', 'moisturizer', 'sunscreen', 'face oil', 'face mask', 'lip care']
const MAKEUP_CATEGORIES = ['concealer', 'foundation', 'blush', 'lipstick', 'eyeshadow', 'mascara']

function ProductCard({ product, onDelete, onEdit }) {
  const confirmDelete = () => {
    Alert.alert('delete product', `remove ${product.name} from your stash?`, [
      { text: 'delete', style: 'destructive', onPress: () => onDelete(product.id) },
      { text: 'cancel', style: 'cancel' },
    ])
  }

  return (
    <TouchableOpacity onPress={() => onEdit(product)} onLongPress={confirmDelete} style={styles.card}>
      {product.image_url
        ? <Image source={{ uri: product.image_url }} style={styles.image} />
        : <View style={styles.image} />
      }
      <Text style={styles.brand}>{product.brand}</Text>
      <Text style={styles.name}>{product.name}</Text>
    </TouchableOpacity>
  )
}

export default function MyStash({ navigation }) {
    const [modalVisible, setModalVisible] = useState(false)
    const [view, setView] = useState('menu')
    const [name, setName] = useState('')
    const [brand, setBrand] = useState('')
    const [category, setCategory] = useState('')
    const [ingredients, setIngredients] = useState('')
    const [productImage, setProductImage] = useState(null)
    const [products, setProducts] = useState([])
    const [scanning, setScanning] = useState(false)
    const [editingProduct, setEditingProduct] = useState(null)

    useEffect(() => {
        supabase.from('stash').select('*').then(({ data, error }) => {
            if (data) setProducts(data)
        })
    }, [])

    const pickImage = async () => {
        Alert.alert('add photo', 'choose an option', [
            {text: 'take a photo', onPress: () => openCamera()},
            {text: 'choose from library', onPress: () => openLibrary()},
            {text: 'cancel', style: 'cancel'},
        ])
    }

    const openCamera = async () => {
        const result = await ImagePicker.launchCameraAsync({mediaTypes: ['images']})
        if (!result.canceled) setProductImage(result.assets[0].uri)
    }

    const openLibrary = async() => {
        const result = await ImagePicker.launchImageLibraryAsync({mediaTypes: ['images']})
        if (!result.canceled) setProductImage(result.assets[0].uri)
    }

    const openEdit = (product) => {
        setEditingProduct(product)
        setName(product.name || '')
        setBrand(product.brand || '')
        setCategory(product.category || '')
        setIngredients(product.ingredients || '')
        setProductImage(null)
        setView('manual')
        setModalVisible(true)
    }

    const resetForm = () => {
        setEditingProduct(null)
        setName('')
        setBrand('')
        setCategory('')
        setIngredients('')
        setProductImage(null)
        setModalVisible(false)
        setView('menu')
    }

    const deleteProduct = async (id) => {
        const { error } = await supabase.from('stash').delete().eq('id', id)
        if (!error) {
            setProducts(products.filter(p => p.id !== id))
            await supabase.from('profiles').update({ routine: null })
        }
    }

    const saveProduct = async () => {
        if (!name.trim() || !brand.trim() || !category || !ingredients.trim()) {
            Alert.alert('missing fields', 'please fill in name, brand, category and ingredients before saving!')
            return
        }

        let image_url = null

        if (productImage) {
            const filename = `${Date.now()}.jpg`
            const formData = new FormData()
            formData.append('file', { uri: productImage, name: filename, type: 'image/jpeg' })
            const { error: uploadError } = await supabase.storage
                .from('product-images')
                .upload(filename, formData, { contentType: 'multipart/form-data' })
            if (uploadError) console.log('upload error:', uploadError)
            else {
                const { data: urlData } = supabase.storage
                    .from('product-images')
                    .getPublicUrl(filename)
                image_url = urlData.publicUrl
            }
        }

        const payload = { name, brand, category, ingredients, ...(image_url && { image_url }) }

        let error
        if (editingProduct) {
            ({ error } = await supabase.from('stash').update(payload).eq('id', editingProduct.id))
        } else {
            ({ error } = await supabase.from('stash').insert({ ...payload, image_url }))
        }

        if (error) console.log('error saving:', error)
        else {
            const { data } = await supabase.from('stash').select('*')
            if (data) setProducts(data)
            if (SKINCARE_CATEGORIES.includes(category)) {
                await supabase.from('profiles').update({ routine: null })
            }
            resetForm()
        }
    }

    const scanProduct = async () => {
        const result = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], base64: true })
        if (result.canceled) return

        setView('manual')
        setScanning(true)
        
        try {
            const response = await fetch('https://recreate-thing-champion.ngrok-free.dev/stash/scan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image: result.assets[0].base64 })
            })
            const data = await response.json()
            setName(data.name)
            setBrand(data.brand)
            setCategory(data.category)
            setIngredients(data.ingredients)
        } catch (e) {
            console.log('scan error:', e)
        } finally {
            setScanning(false)
        }
    }

    return (
        <View style={styles.container}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.back}>← back</Text>
        </TouchableOpacity>

        {/* title */}
        <Text style={styles.title}>my stash 🧴</Text>
        <Text style={styles.sub}>all your products in one place!</Text>
        
        {/* product cards */}
        <FlatList
            data={products}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <ProductCard product={item} onDelete={deleteProduct} onEdit={openEdit} />}
            numColumns={2}
        />
        
        {/* add button */}
        <TouchableOpacity style={styles.addButton}
            onPress={() => setModalVisible(true)}
        >
            <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>

        {/* add new product modal */}
        <Modal visible={modalVisible} animationType="slide" onDismiss={resetForm}>
            <View style={styles.modal}>
                {view === 'menu' ? (
                    <>
                        <Text style={styles.modalTitle}>add a product</Text>
                        <Text style={styles.modalSubTitle}>add a product to your stash!</Text>
                        <TouchableOpacity style={styles.closeButton} onPress={resetForm}>
                            <Text style={styles.closeText}>✕ close</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionButton} onPress={scanProduct}>
                            <Text style={styles.actionEmoji}>📷</Text>
                            <Text style={styles.actionText}>scan product</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionButton} onPress={() => setView('manual')}>
                            <Text style={styles.actionEmoji}>✏️</Text>
                            <Text style={styles.actionText}>fill in manually</Text>
                        </TouchableOpacity>
                    </>
                ) : (
                    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <Text style={styles.modalTitle}>
                                {scanning ? 'scanning... 🔍' : editingProduct ? 'edit product' : 'add a product'}
                            </Text>
                            {scanning && (
                                <ActivityIndicator color="#C9A99A" style={{ marginBottom: 8 }} />
                            )}
                            <Text style={styles.modalSubTitle}>{editingProduct ? 'update your product details' : 'add your new product!'}</Text>
                            <TouchableOpacity style={styles.closeButton} onPress={editingProduct ? resetForm : () => setView('menu')}>
                                <Text style={styles.closeText}>{editingProduct ? '✕ close' : '← back'}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
                                {productImage ? (
                                    <Image source={{ uri: productImage }} style={styles.imagePreview} />
                                ) : (
                                    <Text style={styles.imagePickerText}>📷 tap to add photo</Text>
                                )}
                            </TouchableOpacity>
                            <TextInput
                                style={styles.input}
                                value={name}
                                onChangeText={(text) => setName(text)}
                                placeholder="product name"
                                placeholderTextColor="#C9A99A"
                            />
                            <TextInput
                                style={styles.input}
                                value={brand}
                                onChangeText={setBrand}
                                placeholder="brand"
                                placeholderTextColor="#C9A99A"
                            />
                            <Text style={styles.categoryLabel}>skincare</Text>
                            <View style={styles.categoryRow}>
                                {SKINCARE_CATEGORIES.map(c => (
                                    <TouchableOpacity
                                        key={c}
                                        style={[styles.categoryChip, category === c && styles.categoryChipSelected]}
                                        onPress={() => setCategory(c)}
                                    >
                                        <Text style={[styles.categoryChipText, category === c && styles.categoryChipTextSelected]}>{c}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                            <Text style={styles.categoryLabel}>makeup</Text>
                            <View style={styles.categoryRow}>
                                {MAKEUP_CATEGORIES.map(c => (
                                    <TouchableOpacity
                                        key={c}
                                        style={[styles.categoryChip, category === c && styles.categoryChipSelected]}
                                        onPress={() => setCategory(c)}
                                    >
                                        <Text style={[styles.categoryChipText, category === c && styles.categoryChipTextSelected]}>{c}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                            <TextInput
                                style={[styles.input, { marginTop: 16 }]}
                                value={ingredients}
                                onChangeText={setIngredients}
                                placeholder="ingredients"
                                placeholderTextColor="#C9A99A"
                            />
                            <TouchableOpacity style={styles.saveButton} onPress={saveProduct}>
                                <Text style={styles.saveButtonText}>{editingProduct ? 'update product' : 'save to stash'}</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </KeyboardAvoidingView>
                )}
            </View>
        </Modal>
        </View>
    )
}

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: '#FFF5F7', 
        padding: 24, paddingTop: 60 
    },
    back: { 
        color: '#C9A99A', 
        fontSize: 14, 
        marginBottom: 40 
    },
    emoji: { 
        fontSize: 60, 
        textAlign: 'center', 
        marginBottom: 16 
    },
    title: { 
        fontSize: 28, 
        color: '#5C3D35', 
        fontStyle: 'italic', 
        textAlign: 'center', 
        marginBottom: 8 
    },
    sub: { 
        fontSize: 14, 
        color: '#C9A99A', 
        textAlign: 'center',
        marginBottom: 40,
        letterSpacing: 1,
    },
    card: {
        width: '48%',
        backgroundColor: '#fff',
        borderRadius: 12,
        margin: '1%',
    },
    image: {
        width: '100%',
        height: 150,
        backgroundColor: '#f0e6e6',
        borderRadius: 12,
    },
    brand:{
        fontSize: 11,
        color: "#C9A99A",
        padding: 8,
    },
    name: {
        fontSize: 13,
        color:'#5C3D35',
        paddingHorizontal: 8,
        paddingBottom: 8,
    },
    addButton: {
        position: 'absolute',
        bottom: 32,
        alignSelf: 'center',
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#C9A99A',
        justifyContent: 'center',
        alignItems: 'center',
    },
    addButtonText:{
        fontSize: 28,
        color: '#fff',
    },
    modal: {
        flex: 1,
        backgroundColor: '#FFF5F7',
        padding: 24,
        paddingTop: 60,
    },
    modalTitle: {
        fontSize: 28, 
        color: '#5C3D35', 
        fontStyle: 'italic', 
        textAlign: 'center', 
        marginBottom: 8 
    },
    modalSubTitle: {
        fontSize: 14, 
        color: '#C9A99A', 
        textAlign: 'center',
        marginBottom: 40,
        letterSpacing: 1,
    },
    closeButton: {
        position: 'absolute',
        top: 60,
        right: 24,
    },
    closeText: {
        color: '#C9A99A',
        fontSize: 14,
    },
    actionButton: {
        backgroundColor: '#7D5A52',
        borderRadius: 20,
        padding: 32,
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 40,
        gap: 12,
        marginBottom: 16,
    },
    actionText: {
        color: '#FFF5F7',
        fontStyle: 'italic',
        fontSize: 16,
        letterSpacing: 1,
    },
    actionEmoji: {
        fontSize: 48,
        marginBottom: 4,
    },
    input: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        color: '#5C3D35',
        fontSize: 14,
    },
    imagePicker: {
        width: '100%',
        height: 200,
        backgroundColor: '#f0e6e6',
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    imagePreview: {
        width: '100%',
        height: 200,
        borderRadius: 16,
    },
    saveButton: {
        backgroundColor: '#C9A99A',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        marginTop: 8,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontStyle: 'italic',
        letterSpacing: 1,
    },
    categoryLabel: {
        fontSize: 11,
        color: '#C9A99A',
        letterSpacing: 1,
        marginBottom: 8,
        marginTop: 12,
    },
    categoryRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 4,
    },
    categoryChip: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#e8d5d0',
    },
    categoryChipSelected: {
        backgroundColor: '#C9A99A',
        borderColor: '#C9A99A',
    },
    categoryChipText: {
        fontSize: 12,
        color: '#C9A99A',
    },
    categoryChipTextSelected: {
        color: '#fff',
    },
})