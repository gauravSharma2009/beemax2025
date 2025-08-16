import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { allCategoryPink, categoryTextpurpleColor, textColor, whiteTxtColor, BackgroundGray, offPurpleColor } from './colours';
import { currency } from './strings';

const VariantSelect = (props) => {
    const { variants: data, setDetail, productId, navigation } = props;
    const { Size } = data;
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [selectedIndex, selectIndex] = useState(0)

    useEffect(() => {
        let index = Object.keys(Size).indexOf(''+productId);
        selectIndex(index)
        //Object.keys(Size).findIndex((item))
        //productId
    }, [])

    return (
        <View style={styles.container}>
            {Object.keys(Size).map((variant, index) => (
                <TouchableOpacity
                    key={index}
                    style={[
                        styles.variantItem,
                        selectedIndex === index && styles.selectedVariant,
                    ]}
                    onPress={() => navigation.push("ProductDetails", { product: { ...data[variant], id: variant } })
                    }
                >
                    <View>
                        <Text style={styles.weight}>{Size[variant].Size}</Text>
                        <View style={{ flexDirection: 'row' }}>
                            <Text style={styles.price}>
                                {currency}{Size[variant].selling_price}
                            </Text>
                            <Text style={styles.mrp}>{currency}{Size[variant].mrp_price}</Text>
                            <Text style={styles.discount}>
                                {Size[variant].discount_percentage}% off </Text>
                        </View>

                    </View>
                    <TouchableOpacity
                        onPress={() => {
                            navigation.push("ProductDetails", { product: { ...data[variant], id: variant } })
                        }}
                        style={styles.selectButton}>
                        <Text style={styles.selectButtonText}>Select</Text>
                    </TouchableOpacity>
                </TouchableOpacity>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingVertical: 10,
        paddingHorizontal: 5,
        backgroundColor: '#fff',
    },
    variantItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 10,
        borderRadius: 5,
        marginTop: 10,
        borderColor: BackgroundGray,
        borderWidth: 2,
    },
    selectedVariant: {
        borderColor: categoryTextpurpleColor,
        borderWidth: 2,
        paddingHorizontal: 10,
        marginTop: 10

    },
    weight: {
        fontSize: 20,
        marginBottom: 5,
        fontFamily: 'Poppins-Regular'
    },
    price: {
        fontSize: 16,
        color: textColor,
        marginBottom: 2,
        fontFamily: 'Poppins-Regular',
        alignSelf: 'center'
    },
    mrp: {
        fontSize: 14,
        color: '#999',
        marginBottom: 2,
        marginLeft: 10,
        fontFamily: 'Poppins-Regular',
        alignSelf: 'center'

    },
    discount: {
        fontSize: 14,
        color: whiteTxtColor,
        marginLeft: 10,
        backgroundColor: offPurpleColor,
        padding: 5,
        borderRadius: 10,
        fontFamily: 'Poppins-Regular'

    },
    selectButton: {
        backgroundColor: allCategoryPink,
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderRadius: 5,
    },
    selectButtonText: {
        color: '#fff',
        fontSize: 16,
        fontFamily: 'Poppins-Regular',
    },
});

export default VariantSelect;
