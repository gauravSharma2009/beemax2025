import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { changeCartCount } from '../actions/cartCount';
import { setPopup } from '../actions/message';
import store from '../store/configureStore';
import { server } from './apiConstant';
import { getData } from './asyncStore';
import { allCategoryPink, whiteTxtColor } from './colours';

const AddButtonCMP = (props) => {

    const { item, addItem, minusItem, type, changeLoadingState, callBack, style,
        changeCartCount, setAction = undefined, index = undefined, isAddedToCart = false, freeDealAddedToCart = false,
        isAddBlocked = false } = props;
    const [quantity, setQuantity] = useState(0);

    useEffect(() => {

        item.qty_added_in_cart ? setQuantity(Number(item.qty_added_in_cart)) : setQuantity(0);
    }, [])

    const checkCartCount = async () => {
        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        myHeaders.append("Cookie", "ci_session=2bf9726eebea7926b7c73664c9a4797ab758ba13");
        const uniqueId = await getData("uniqueId")

        var requestOptions = {
            method: 'GET',
            headers: myHeaders,
            redirect: 'follow'
        };
        const url = `${server}countcartdata/${uniqueId}`;
        fetch(url, requestOptions)
            .then(response => response.json())
            .then(result => {
                changeCartCount(result.data)
                console.log("check cart count response :  ", result)
            })
            .catch(error => {
                console.log('error', error)

            });
    }

    const addToCart = async ({ product, qty, type }) => {
        //  console.log("  product:  ", product)
        //  return;
        if (isAddBlocked) {
            return
        }
        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        myHeaders.append("Cookie", "ci_session=2bf9726eebea7926b7c73664c9a4797ab758ba13");
        const loginData = await getData("loginData")
        const userData = JSON.parse(loginData)
        const uniqueId = await getData("uniqueId")

        var raw = JSON.stringify({
            "seller_id": product.seller_id,
            "user_id": userData?.USER_ID,
            "product_id": product.id,
            "device_id": uniqueId,
            "qty": qty
        });
        console.log("raw : ", raw)
        //return;

        var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: raw,
            redirect: 'follow'
        };
        changeLoadingState(true)
        const url = `${server}addtocart`;
        fetch(url, requestOptions)
            .then(response => response.json())
            .then(result => {
                console.log("result  :  ", result)
                changeLoadingState(false)
                if (result && result.status) {
                    setAction ? setAction(product) : callBack()

                } else
                    store.dispatch(setPopup({ message: result.message, status: "faliure", open: true }))

            })
            .catch(error => {
                console.log('error', error)
                changeLoadingState(false)

            });
    }
    const handleAdd = () => {
        //return;
        // alert("hello"+isAddBlocked)
        if(isAddBlocked){
            return
        }
        addItem ? addItem(quantity + 1, item) : addToCart({ product: item, qty: 1, type: 'add' })
        setQuantity(quantity + 1);
        setTimeout(() => {
            checkCartCount()
        }, 3000)
    };

    const handleMinus = () => {
        if (quantity > 0 && Number(item.qty_added_in_cart) > 0) {
            minusItem ? minusItem(Number(item.qty_added_in_cart) - 1, item) : addToCart({ product: item, qty: -1, type: 'minus' })
            setQuantity(Math.max(0, quantity - 1));
            setTimeout(() => {
                checkCartCount()
            }, 3000)
        }
    };
    // if (item?.is_deal_product === "1") {
    //     return <TouchableOpacity
    //         onPress={handleMinus}
    //         style={[styles.button, { backgroundColor: item.in_stock === "0" || parseInt(item.inventory) < 1 ? "#E5E5E5" : allCategoryPink, borderColor: allCategoryPink, borderWidth: 1 }, style, { maxHeight: 35 }]}
    //     >
    //         <Text style={[styles.addButton, { color: whiteTxtColor, fontSize: 14 }]}>Remove</Text>
    //     </TouchableOpacity>
    // }
    // console.log("values : ", isAddedToCart, item.is_deal_product, item.is_deal_product == '1')

    if (freeDealAddedToCart) {
        return <View style={[styles.button, style, { maxHeight: 35, width: 90, backgroundColor: '#d0d0d0' }]}
        >
            <Text style={styles.addButton}>Add</Text>
        </View>
    }
    if (isAddedToCart && item.is_deal_product && item.is_deal_product == '1') {
        return <TouchableOpacity style={[styles.button, style, { maxHeight: 35, width: 90 }]}
            onPress={handleMinus}>
            <Text style={styles.addButton}>Remove</Text>
        </TouchableOpacity>
    }
    if (!item.qty_added_in_cart || item.is_added_in_cart == '0') {
        return <TouchableOpacity style={[styles.button, style, { maxHeight: 35 }]}
            onPress={item.in_stock === "0" || parseInt(item.inventory) < 1 ? null : handleAdd}>
            <Text style={styles.addButton}>Add</Text>
        </TouchableOpacity>
    }
    if (item.is_added_in_cart == '0') {
        return <TouchableOpacity style={[styles.button, style, { maxHeight: 35, backgroundColor: item.in_stock === "0" || parseInt(item.inventory) < 1 ? "#E5E5E5" : allCategoryPink }]}
            onPress={item.in_stock === "0" || parseInt(item.inventory) < 1 ? null : handleAdd}>
            {!item.qty_added_in_cart || Number(item.qty_added_in_cart) === 0 ? (
                <Text style={styles.addButton}>Add</Text>
            ) : (
                <View style={styles.quantityContainer}>
                    <TouchableOpacity style={styles.minusButton} onPress={item.in_stock === "0" || parseInt(item.inventory) < 1 || quantity <= 0 ? null : handleMinus}>
                        <Text style={styles.quantityText}>-</Text>
                    </TouchableOpacity>
                    <Text style={styles.quantity}>{'' + item.qty_added_in_cart ? Number(item.qty_added_in_cart) : 0}</Text>
                    <TouchableOpacity style={styles.plusButton} onPress={item.in_stock === "0" || parseInt(item.inventory) < 1 ? null : handleAdd}>
                        <Text style={styles.quantityText}>+</Text>
                    </TouchableOpacity>
                </View>
            )}
        </TouchableOpacity>
    }

    return (
        type && type === 'plus' ?
            !item.qty_added_in_cart || Number(item.qty_added_in_cart) === 0 ?
                <TouchableOpacity
                    onPress={item.in_stock === "0" || parseInt(item.inventory) < 1 ? null : handleAdd}
                    style={[styles.button, { backgroundColor: item.in_stock === "0" || parseInt(item.inventory) < 1 ? "#E5E5E5" : allCategoryPink, borderColor: allCategoryPink, borderWidth: 1 }, style, { maxHeight: 35 }]} 
                    // onPress={handleAdd}
                    >
                    <Text style={[styles.addButton, { color: whiteTxtColor }]}>Add</Text>
                </TouchableOpacity> :
                <View style={[styles.quantityContainer, { backgroundColor: item.in_stock === "0" || parseInt(item.inventory) < 1 ? "#E5E5E5" : allCategoryPink, borderRadius: 5 }, style, { maxHeight: 35 }]}>
                    <TouchableOpacity style={styles.minusButton} onPress={item.in_stock === "0" || parseInt(item.inventory) < 1 || quantity <= 0 ? null : handleMinus}>
                        <Text style={[styles.quantityText, { color: whiteTxtColor, fontSize: 20 }]}>-</Text>
                    </TouchableOpacity>
                    <Text style={[styles.quantity, { color: whiteTxtColor, fontSize: 20 }]}>{'' + quantity}</Text>
                    <TouchableOpacity style={styles.plusButton} onPress={item.in_stock === "0" || parseInt(item.inventory) < 1 ? null : handleAdd}>
                        <Text style={[styles.quantityText, { color: whiteTxtColor, fontSize: 20 }]}>+</Text>
                    </TouchableOpacity>
                </View>
            :
            <TouchableOpacity style={[styles.button, style, { maxHeight: 35, backgroundColor: item.in_stock === "0" || parseInt(item.inventory) < 1 ? "#E5E5E5" : allCategoryPink }]} onPress={item.in_stock === "0" || parseInt(item.inventory) < 1 ? null : handleAdd}>

                {!item.qty_added_in_cart || Number(item.qty_added_in_cart) === 0 ? (
                    <Text style={styles.addButton}>Add</Text>
                ) : (
                    <View style={styles.quantityContainer}>
                        <TouchableOpacity style={styles.minusButton} onPress={item.in_stock === "0" || parseInt(item.inventory) < 1 || quantity <= 0 ? null : handleMinus}>
                            <Text style={styles.quantityText}>-</Text>
                        </TouchableOpacity>
                        <Text style={styles.quantity}>{'' + item.qty_added_in_cart ? Number(item.qty_added_in_cart) : 0}</Text>
                        <TouchableOpacity style={styles.plusButton} onPress={item.in_stock === "0" || parseInt(item.inventory) < 1 ? null : handleAdd}>
                            <Text style={styles.quantityText}>+</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        backgroundColor: allCategoryPink,
        borderRadius: 8,
        paddingHorizontal: 6,
        // paddingVertical: 8,
        width: 75,
        height: 37,
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        marginRight: 6
    },
    addButton: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 14,
        fontFamily: 'Poppins-Regular'

    },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    minusButton: {
        borderRadius: 8,
        paddingHorizontal: 6,
        paddingVertical: 4,
        marginRight: 8,
        fontFamily: 'Poppins-Regular'

    },
    plusButton: {
        borderRadius: 8,
        paddingHorizontal: 6,
        paddingVertical: 4,
        marginLeft: 8,
        fontFamily: 'Poppins-Regular'

    },
    quantityText: {
        color: 'white',
        fontSize: 14,
        fontFamily: 'Poppins-Regular'

    },
    quantity: {
        fontSize: 14,
        color: '#fff',
        fontFamily: 'Poppins-Regular'
    },
});

const mapStateToProps = (state) => {
    return {
        // cartCount: state.cartCount.count
    }
};
const mapDispatchToProps = (dispatch) => {
    return {
        dispatch,
        ...bindActionCreators({ changeCartCount }, dispatch),
    }

}

const AddButton = connect(mapStateToProps, mapDispatchToProps)(AddButtonCMP);

export default AddButton;
