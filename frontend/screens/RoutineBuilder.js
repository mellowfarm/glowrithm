import { StyleSheet, Text, View, TouchableOpacity, Modal, Alert, ScrollView } from 'react-native'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const SKIN_TYPES = ['oily', 'dry', 'combination', 'normal', 'sensitive']
const CONCERNS = ['acne', 'aging', 'dryness', 'hyperpigmentation', 'redness']
const GOALS = ['clear skin', 'glow', 'anti-aging', 'hydration']
const SKINCARE_CATEGORIES = ['cleanser', 'toner', 'essence', 'serum', 'eye cream', 'moisturizer', 'sunscreen', 'face oil', 'face mask', 'lip care']

export default function RoutineBuilder({ navigation }) {
    const [quizVisible, setQuizVisible] = useState(false)
    const [skinType, setSkinType] = useState('')
    const [concerns, setConcerns] = useState([])
    const [goals, setGoals] = useState([])
    const [routine, setRoutine] = useState(null)
    const [loading, setLoading] = useState(false)
    const [profileId, setProfileId] = useState(null)

    const toggleItem = (array, setArray, item) => {
        if (array.includes(item)) {
            setArray(array.filter(i => i != item)) // removes item from array
        } else {
            setArray([...array, item]) // adds item to array
        }
    }

    const saveProfile = async () => {
        if (!skinType || concerns.length === 0 || goals.length === 0) {
            Alert.alert('missing info', 'please fill in all three questions!')
            return
        }

        const { error } = await supabase.from('profiles').upsert({
            ...(profileId && { id: profileId }),
            skin_type: skinType,
            skin_concerns: concerns.join(', '),
            goals: goals.join(', '),
            routine: null,
        })

        if (error) console.log('error saving profile:', error)
        else {
            setQuizVisible(false)
            generateRoutine()
        }
    }

    useEffect(() => {
        const checkProfile = async () => {
            const { data } = await supabase.from('profiles').select('*').single()
            if (data) {
                setProfileId(data.id)
                if (data.routine) {
                    setRoutine(data.routine)
                } else {
                    generateRoutine()
                }
            } else {
                setQuizVisible(true)
            }
        }
        checkProfile()
    }, [])

    const generateRoutine = async () => {
        setLoading(true)
        console.log('generating routine...')
        try {
            // fetch profile (rename data to profile)
            const {data: profile} = await supabase.from('profiles').select('*').single()

            // fetch skincare products only
            const {data: allProducts} = await supabase.from('stash').select('*')
            const skincareProducts = allProducts.filter(p => SKINCARE_CATEGORIES.includes(p.category))

            // call backend
            const response = await fetch('https://recreate-thing-champion.ngrok-free.dev/routine/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    skin_type: profile.skin_type,
                    skin_concerns: profile.skin_concerns,
                    goals: profile.goals,
                    products: skincareProducts,
                })
            })

            const data = await response.json()
            setRoutine(data)
            await supabase.from('profiles').update({ routine: data }).eq('id', profile.id)
        } catch (e) {
            console.log('error generating routine:', e)
        } finally {
            setLoading(false)
        }
    }

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
                <Text style={styles.back}>← back</Text>
            </TouchableOpacity>

            <Text style={styles.title}>my routine 🌿</Text>
            <Text style={styles.sub}>your personalized skincare routine</Text>
            
            {/* retake button */}
            <TouchableOpacity style={styles.retakeButton} onPress={() => {
                setSkinType('')
                setConcerns([])
                setGoals([])
                setQuizVisible(true)
            }}>
                <Text style={styles.retakeText}>retake quiz</Text>
            </TouchableOpacity>

            {/* display routine */}
            {loading && <Text style={styles.sub}>building your routine... ✨</Text>}

            {routine && !loading && (
                <ScrollView showsVerticalScrollIndicator={false}>
                    <View style={styles.routineCard}>
                        <Text style={styles.sectionTitle}>☀️ morning</Text>
                        {routine.am.map((step, i) => (
                            <Text key={i} style={styles.step}>{step}</Text>
                        ))}
                    </View>

                    <View style={styles.routineCard}>
                        <Text style={styles.sectionTitle}>🌙 evening</Text>
                        {routine.pm.map((step, i) => (
                            <Text key={i} style={styles.step}>{step}</Text>
                        ))}
                    </View>

                    <View style={styles.routineCard}>
                        <Text style={styles.sectionTitle}>⚠️ gaps</Text>
                        {routine.gaps.map((gap, i) => (
                            <Text key={i} style={styles.gap}>{gap}</Text>
                        ))}
                    </View>

                    <View style={styles.routineCard}>
                        <Text style={styles.sectionTitle}>✨ next buy</Text>
                        <Text style={styles.nextBuy}>{routine.next_buy}</Text>
                    </View>
                </ScrollView>
            )}

            {/* skin quiz */}
            <Modal visible={quizVisible} animationType="slide">
                <View style={styles.modal}>
                    <Text style={styles.modalTitle}>skin quiz 🌸</Text>
                    <Text style={styles.modalSubTitle}>let's get to know your skin!</Text>

                    {/* skin type question */}
                    <Text style={styles.questionLabel}>what's your skin type?</Text>
                    <View style={styles.chipRow}>
                        {SKIN_TYPES.map(type => (
                            <TouchableOpacity
                            key={type}
                            style={[styles.chip, skinType == type && styles.chipSelected]}
                            onPress={(() => setSkinType(type))}
                            >
                                <Text style={[styles.chipText, skinType == type && styles.chipTextSelected]}>{type}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* skin concerns question */}
                    <Text style={styles.questionLabel}>select some of your skin concerns!</Text>
                    <View style={styles.chipRow}>
                        {CONCERNS.map(concern => (
                            <TouchableOpacity
                            key={concern}
                            style={[styles.chip, concerns.includes(concern) && styles.chipSelected]}
                            onPress={(() => toggleItem(concerns, setConcerns, concern))}
                            >
                                <Text style={[styles.chipText, concerns.includes(concern) && styles.chipTextSelected]}>{concern}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* skin goals question */}
                    <Text style={styles.questionLabel}>what are your goals for your skin?</Text>
                    <View style={styles.chipRow}>
                        {GOALS.map(goal => (
                            <TouchableOpacity
                            key={goal}
                            style={[styles.chip, goals.includes(goal) && styles.chipSelected]}
                            onPress={(() => toggleItem(goals, setGoals, goal))}
                            >
                                <Text style={[styles.chipText, goals.includes(goal) && styles.chipTextSelected]}>{goal}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                    <TouchableOpacity 
                        style={styles.submitButton}
                        onPress={saveProfile}
                    >
                        <Text style={styles.submitButtonText}>build my routine ✨</Text>
                    </TouchableOpacity>
                </View>
            </Modal>
        </View>
    )
}

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: '#FFF5F7', 
        padding: 24, 
        paddingTop: 60,
    },
    back: { 
        color: '#C9A99A', 
        fontSize: 14, 
        marginBottom: 40,
    },
    emoji: { 
        fontSize: 60, 
        textAlign: 'center', 
        marginBottom: 16, 
    },
    title: { 
        fontSize: 28, 
        color: '#5C3D35', 
        fontStyle: 'italic', 
        textAlign: 'center', 
        marginBottom: 8,
    },
    sub: { 
        fontSize: 14, 
        color: '#C9A99A', 
        textAlign: 'center', 
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
        marginBottom: 8,
    },
    modalSubTitle: { 
        fontSize: 14, 
        color: '#C9A99A', 
        textAlign: 'center', 
        marginBottom: 40, 
        letterSpacing: 1,
    },
    questionLabel: { 
        fontSize: 13, 
        color: '#5C3D35', 
        marginBottom: 12, 
        marginTop: 8,
    },
    chipRow: { 
        flexDirection: 'row', 
        flexWrap: 'wrap', 
        gap: 8, 
        marginBottom: 24,
    },
    chip: { 
        paddingHorizontal: 16, 
        paddingVertical: 8, 
        borderRadius: 20, 
        backgroundColor: '#fff', 
        borderWidth: 1, 
        borderColor: '#e8d5d0',
    },
    chipSelected: { 
        backgroundColor: '#C9A99A', 
        borderColor: '#C9A99A',
    },
    chipText: { 
        fontSize: 13, 
        color: '#C9A99A',
    },
    chipTextSelected: { 
        color: '#fff',
    },
    submitButton: { 
        backgroundColor: '#C9A99A', 
        borderRadius: 12, 
        padding: 16, 
        alignItems: 'center', 
        marginTop: 24,
    },
    submitButtonText: { 
        color: '#fff', 
        fontSize: 16, 
        fontStyle: 'italic', 
        letterSpacing: 1,
    },
    retakeButton: {
        alignSelf: 'center',
        borderWidth: 1,
        borderColor: '#C9A99A',
        borderRadius: 20,
        paddingHorizontal: 20,
        paddingVertical: 8,
        marginTop: 16,
        marginBottom: 16,
    },
    retakeText: {
        color: '#C9A99A',
        fontSize: 13,
        letterSpacing: 1,
    },
    sectionTitle: { 
        fontSize: 16, 
        color: '#5C3D35', 
        fontWeight: 'bold', 
        marginTop: 24, 
        marginBottom: 8 
    },
    step: { 
        fontSize: 14, 
        color: '#5C3D35', 
        marginBottom: 6, 
        paddingLeft: 8 
    },
    gap: { 
        fontSize: 14, 
        color: '#C9A99A', 
        marginBottom: 6, 
        paddingLeft: 8 
    },
    nextBuy: {
        fontSize: 14,
        color: '#7D5A52',
        fontStyle: 'italic',
        paddingLeft: 8
    },
    routineCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        marginTop: 8,
    },
})