// In App.js in a new project

import * as React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Categories from '../screens/Categories';


const Stack = createNativeStackNavigator();

function CategoriesStack() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false
            }}
        >
            <Stack.Screen name="Categories" component={Categories} />
            {/* <Stack.Screen name="ProductListing" component={ProductListing} /> */}

        </Stack.Navigator>
    );
}

export default CategoriesStack;