import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import HomeScreen from './screens/HomeScreen'
import ProductFinder from './screens/ProductFinder'
import IngredientChecker from './screens/IngredientChecker'
import RoutineBuilder from './screens/RoutineBuilder'
import MyStash from './screens/MyStash'

const Stack = createNativeStackNavigator() // creates a stack of screens, push a new screen on top, press back and it pops off

export default function App() {
  // NavigationContainer wraps whole app, manages navigation state
  // Stack.Navigator holds all screens, defines the order
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="ProductFinder" component={ProductFinder} />
        <Stack.Screen name="Ingredient" component={IngredientChecker} />
        <Stack.Screen name="Routine" component={RoutineBuilder} />
        <Stack.Screen name="Stash" component={MyStash} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}