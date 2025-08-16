// In App.js in a new project

import * as React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Home from '../screens/Home';
import ProductListing from '../screens/ProductListing';
import Subcategories from '../screens/SubCategories';
import SubSubcategories from '../screens/SubSubCategories';
import ProductDetails from '../screens/ProductDetails';
import ProductSearchPage from '../screens/Search';
import PincodePage from '../screens/PincodePage';



const Stack = createNativeStackNavigator();

function HomeStack() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false
            }}
        >
            <Stack.Screen name="Home" component={Home} />
            {/* <Stack.Screen name="ProductListing" component={ProductListing} /> */}
            <Stack.Screen name="SubCategories" component={Subcategories} />
            <Stack.Screen name="SubSubCategories" component={SubSubcategories} />
            <Stack.Screen name="ProductSearchPage" component={ProductSearchPage} />
            <Stack.Screen name="PincodePage" component={PincodePage} />

            
            
        </Stack.Navigator>
    );
}

export default HomeStack;