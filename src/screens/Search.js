import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, KeyboardAvoidingView } from 'react-native';
import { changeLoadingState } from "../actions/loadingAction"
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { server } from '../common/apiConstant';
import ProductItem from '../common/ProductItem';
import { getData } from '../common/asyncStore';
import { Image } from 'react-native';
import { TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { offPurpleColor, whiteTxtColor } from '../common/colours';

const ProductSearch = (props) => {
    const { navigation, pinCode, changeLoadingState } = props
    const [searchText, setSearchText] = useState('');
    const [products, setProducts] = useState([]);

    const fetchProducts = async () => {
        try {
            var myHeaders = new Headers();
            myHeaders.append("Cookie", "ci_session=60c995a3aa504990699898a87b440296b8f27223");
            const uniqueId = await getData("uniqueId")

            var raw = JSON.stringify({
                "keyword": searchText,
                "pincode": pinCode,
                "cart_id": uniqueId || ''
            });
            var requestOptions = {
                method: 'POST',
                headers: myHeaders,
                redirect: 'follow',
                body: raw,
            };
            console.log(" calling : ", `${server}searchproduct`, raw)
            fetch(`${server}searchproduct`, requestOptions)
                .then(response => response.json())
                .then(result => {
                    console.log("result.data  : ", result)

                    setProducts(result?.data?.aProductListData)
                })
                .catch(error => console.log('error', error));

        } catch (error) {
            console.error('Error fetching products:', error);
            setProducts([]);
        }
    };

    useEffect(() => {
        if (searchText === '') {
            setProducts([]);
            return;
        }
        fetchProducts();
    }, [searchText]);

    const handleTextChange = (text) => {
        setSearchText(text);
    };

    const renderItem = ({ item, index }) => (
        <ProductItem
            navigation={navigation}
            getProductList={fetchProducts}
            changeLoadingState={changeLoadingState}
            item={item}
            index={index}
        />
    );

    return (
        <KeyboardAvoidingView style={styles.container}>
            <View style={{  width: "100%", backgroundColor: '#3b006a', justifyContent: 'space-between', paddingVertical: 15 }}>
                <Ionicons
                    onPress={() => {
                        navigation.goBack()
                    }}
                    // <ion-icon name="arrow-back-outline"></ion-icon>
                    style={{ marginLeft: 10 }}
                    name="arrow-back-outline"
                    size={28}
                    color={whiteTxtColor} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search products"
                    placeholderTextColor="#d0d0d0"
                    value={searchText}
                    backgroundColor={'white'}
                    onChangeText={handleTextChange}
                />
            </View>
            {
                products && products.length > 0 ? <FlatList
                    style={{ width: '100%', flex: .88 }}
                    data={products}
                    numColumns={2}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.listContainer}
                /> : <View style={{ flex: 1, justifyContent: 'center' }}>
                    <Image
                        style={{ width: 75, height: 75, alignSelf: 'center' }}
                        source={require('../../assets/icons/empty_product_list.png')}
                    />
                </View>
            }

        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    searchInput: {
        marginBottom: 8,
        padding: 8,
        marginTop: 8,
        borderColor: 'white',
        borderWidth: 1,
        borderRadius: 4,
        marginHorizontal: 10,
        color: offPurpleColor
    },
    listContainer: {
        flexGrow: 1,
    },
    productItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 8,
        borderBottomWidth: 1,
        borderBottomColor: 'gray',
    },
});
const mapStateToProps = (state) => {
    // console.log("redux state : ", state)
    return {
        pinCode: state.pinCode.pincode
    }
};
const mapDispatchToProps = (dispatch) => {
    return {
        dispatch,
        ...bindActionCreators({ changeLoadingState }, dispatch),
    }

}

const ProductSearchPage = connect(mapStateToProps, mapDispatchToProps)(ProductSearch);
export default ProductSearchPage;

