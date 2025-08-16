import React, { useState, useEffect, useMemo } from 'react'
import { TouchableOpacity, View, Text, StyleSheet, Image } from 'react-native'
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { allCategoryPink, buttonBgColor, textColor, whiteTxtColor } from './colours'

const CustomTab = (props) => {
    const { cartCount = 0 } = props;
    const [selected, setSelected] = useState(0)
    const [selected1, setSelected1] = useState(true)
    const [selected2, setSelected2] = useState(false)
    const [selected3, setSelected3] = useState(false)
    const [selected4, setSelected4] = useState(false)
    const [selected5, setSelected5] = useState(false)

    const navigateToFirstScreen = () => {
        props.navigation.navigate('HomeStack');
        setSelected(0)
        setSelected4(false)
        setSelected4(false)
        setSelected3(false)
        setSelected2(false)
        setSelected1(true)
    }

    const navigateToSecondScreen = () => {
        props.navigation.navigate('CategoriesStack');
        setSelected(1)
        setSelected5(false)
        setSelected4(false)
        setSelected3(false)
        setSelected2(true)
        setSelected1(false)
    }

    const navigateToThirdScreen = () => {
        props.navigation.navigate('Offers');
        setSelected(2)
        setSelected5(false)
        setSelected4(false)
        setSelected3(true)
        setSelected2(false)
        setSelected1(false)
    }
    const navigateToForthScreen = () => {
        props.navigation.navigate('Cart');
        setSelected(3)
        setSelected5(false)
        setSelected4(true)
        setSelected3(false)
        setSelected2(false)
        setSelected1(false)
    }
    const navigateToFifthScreen = () => {
        props.navigation.navigate('User');
        setSelected(4)
        setSelected5(true)
        setSelected4(false)
        setSelected3(false)
        setSelected2(false)
        setSelected1(false)
    }
    return (
        <View style={{
            width: '100%', flexDirection: 'row', backgroundColor: whiteTxtColor, padding: 5,
            // backgroundColor: "red",
            alignItems: 'flex-start'
        }} >
            <TouchableOpacity onPress={navigateToFirstScreen}
                style={{ paddingVertical: 5, flex: .25, justifyContent: 'center', alignItems: 'center', }} >
                <Image
                    style={{ width: 25, height: 25, }}
                    source={selected1 ? require('../../assets/icons/home-active.png') : require('../../assets/icons/home.png')}
                />
                <Text style={{ ...styles.TextStyle, color: selected1 ? "#992FC9" : textColor }} >Home</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={navigateToSecondScreen}
                style={{ paddingVertical: 5, flex: .25, justifyContent: 'center', alignItems: 'center' }} >
                <Image
                    style={{ width: 25, height: 25 }}
                    source={selected2 ? require('../../assets/icons/category-active.png') : require('../../assets/icons/category.png')}
                />
                <Text style={{ ...styles.TextStyle, color: selected2 ? "#992FC9" : textColor }} >Categories</Text>


            </TouchableOpacity>


            <TouchableOpacity onPress={navigateToThirdScreen} activeOpacity={0.6}
                style={{ paddingVertical: 5, flex: .25, justifyContent: 'center', alignItems: 'center' }} >
                <Image
                    style={{ width: 25, height: 25, }}
                    source={selected3 ? require('../../assets/discount-active.png') : require('../../assets/discount.png')}
                />
                <Text style={{ ...styles.TextStyle, color: selected3 ? "#992FC9" : textColor }} >Offers</Text>

            </TouchableOpacity>

            <TouchableOpacity onPress={navigateToForthScreen}
                style={{ paddingVertical: 5, flex: .25, justifyContent: 'center', alignItems: 'center' }} >
                <Image
                    style={{ width: 25, height: 25, }}
                    source={selected4 ? require('../../assets/cart-icon-blue.png') : require('../../assets/cart-icon-gray.png')}
                />
                <Text style={{ ...styles.TextStyle, color: selected4 ? "#992FC9" : textColor }} >Cart</Text>
                {cartCount ? (<View style={{ left :25, top:0,position: 'absolute', width: 25, height: 25, backgroundColor: allCategoryPink, borderRadius: 15, justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ color: whiteTxtColor }}>{cartCount}</Text>
                </View>) : null}

            </TouchableOpacity>
            {/* <TouchableOpacity onPress={navigateToFifthScreen}
                style={{ paddingVertical: 5, backgroundColor: selected === 4 ? "#f1f1f1" : "transparent", flex: .2, justifyContent: 'center',  alignItems: 'center' }} >
                <Image
                    style={{ width: 25, height: 25 }}
                    source={require('../../assets/icons/user.png')}
                />
                <Text style={{ ...styles.TextStyle, color: textColor }} >User</Text>


            </TouchableOpacity> */}
        </View>
    );
}

const styles = StyleSheet.create({

    TabBarMainContainer: {
        height: 70,
        flexDirection: 'row',
        width: '100%',
        backgroundColor: whiteTxtColor,
        paddingHorizontal: 5,


    },

    button: {
        height: 46,
        paddingTop: 5,
        paddingBottom: 5,
        backgroundColor: whiteTxtColor,
        justifyContent: 'center',
        alignItems: 'center',
    },

    TextStyle: {
        color: '#fff',
        textAlign: 'center',
        fontSize: 11,
    }

});
const mapStateToProps = (state) => {
    // console.log("redux state : ", state)
    return {
        cartCount: state.cartCount.count
    }
};
const mapDispatchToProps = (dispatch) => {
    return {
        dispatch,
        ...bindActionCreators({}, dispatch),
    }

}

const CustomTabBar = connect(mapStateToProps, mapDispatchToProps)(CustomTab);
export default React.memo(CustomTabBar);