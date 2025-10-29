import React, { useState, useEffect } from "react"
import { Dimensions, FlatList, Image, Text, TouchableOpacity, View } from "react-native"
import { allcategorylist, server } from "../common/apiConstant"
import { BackgroundGray, buttonBgColor, categoryBackground, categorySaperator, subCategoriesname, textColor, whiteTxtColor } from "../common/colours"
import Ionicons from 'react-native-vector-icons/Ionicons';

import { storeData } from "../common/asyncStore";
function Header(props) {
    const { navigation, name, fontSize = 20, onBack, search = false } = props

    return (
        <View style={{ width: '100%', height: Dimensions.get("window").height * .07, flexDirection: 'row', borderBottomColor: categorySaperator, borderBottomWidth: 2, alignItems: 'center', backgroundColor: whiteTxtColor, justifyContent: search ? 'space-between' : null }}>
            <TouchableOpacity
                onPress={() => onBack ? onBack() : navigation.goBack()}
                style={{ marginLeft: 10 }}
            >
                <Image
                    source={require('../../assets/icons/back.png')}
                    style={{ width: 32, height: 32, resizeMode: 'contain' }}
                />
            </TouchableOpacity>
            <Text style={{ fontSize: fontSize, marginLeft: 20, fontFamily: 'Poppins-Regular', color: textColor }}>{name}</Text>
            {search && <TouchableOpacity
                style={{ alignItems: 'center' }}
                onPress={() => {
                    storeData("clickedItem", "")
     navigation.navigate("AutoSuggestSearchPage")

                  //  navigation.navigate("ProductSearchPage")
                }}
            >
                <Image
                    style={{ width: 20, height: 20, alignSelf: 'center', marginRight: 10, tintColor: textColor }}
                    source={require('../../assets/search-white.png')}
                />
            </TouchableOpacity>}
        </View>
    )
}

export default Header;