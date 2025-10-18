import React, { useEffect, useState, useRef } from 'react';
import { TextInput } from 'react-native';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Button, Input } from 'react-native-elements';
import PhoneInput from 'react-native-phone-input';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { setPopup } from '../actions/message';
import { server } from '../common/apiConstant';
import { allCategoryPink, categorySaperator, productPriceColor } from '../common/colours';

const OTPLoginScreen = (props) => {
    const { navigation, setPopup } = props
    const [phoneNumber, setPhoneNumber] = useState('');
    const [validNumber, setValidNumber] = useState(false);
    let phoneInput = useRef(null)
    // const validatePhoneNumber = () => {
    //     setValidNumber(phoneInput.isValidNumber());
    // };

    
    useEffect(() => {
        if (phoneNumber && phoneNumber.length === 10) {
                    console.log("phoneNumber  :  ", phoneNumber)

            setValidNumber(true)
        } else {
                    console.log("phoneNumber 2 :  ", phoneNumber)

            setValidNumber(false)
        }
    }, [phoneNumber])

    const handleLogin = () => {
        if (validNumber) {
            // Call API to login with phone number
            var myHeaders = new Headers();
            myHeaders.append("Content-Type", "application/json");

            var raw = JSON.stringify({
                "mobile": phoneNumber.replace("+91", "")
            });
            console.log("phoneNumber  :  ", raw)
            var requestOptions = {
                method: 'POST',
                headers: myHeaders,
                body: raw,
                redirect: 'follow'
            };

            fetch(`${server}login`, requestOptions)
                .then(response => response.json())
                .then(result => {
                    console.log(result)
                    if (result && result.status) {
                        navigation.navigate("OtpVerifyFlow", { from: "login", mobileNo: phoneNumber.replace("+91", "") })
                        setPopup({ message: result.message, status: "success", open: true })
                        console.log(" hello 1")

                    } else {
                        console.log(" hello")
                        setPopup({ message: result.message, status: "faliure", open: true })

                    }
                    console.log(" afer")
                })
                .catch(error => console.log('error', error));
        }
    };

    return (
        <View style={styles.container}>
            <Image
                source={require('../../assets/background.png')}
                style={styles.backgroundImage}
            />
            <View style={styles.formContainer}>
                <Image
                    style={{ height: 50, resizeMode: 'contain', alignSelf: 'center', marginBottom: 10 }}
                    source={require('../../assets/logo.png')}
                />
                <View style={{ backgroundColor: 'white', paddingVertical: 10, paddingHorizontal: 30, borderRadius: 30 }}>
                    {/* <PhoneInput
                        ref={(ref) => {
                            phoneInput = ref;
                        }}
                       // initialCountry="in"
                        flagStyle={styles.flagStyle}
                        textStyle={styles.textStyle}
                        textProps={{ plceholder: 'Enter your phone number' }}
                        onChangePhoneNumber={(number) => setPhoneNumber(number)}
                        onSelectCountry={() => setValidNumber(false)}
                    /> */}
                    {/* <PhoneInput ref={(ref) => {
                            phoneInput = ref;
                        }}/> */}
                    <TextInput
                        style={{ fontSize: 18 }}
                        maxLength={10}
                        placeholder={"912345XXXXX"}
                        placeholderTextColor={"gray"}
                        keyboardType={'phone-pad'}
                        onChangeText={(text) => setPhoneNumber(text)}
                    />
                </View>

                {!validNumber && phoneNumber !== '' && (
                    <Text style={styles.errorText}>
                        Please enter a valid phone number
                    </Text>
                )}
                {!validNumber && <Button
                    title="LOGIN"
                    buttonStyle={styles.buttonStyle}
                    onPress={handleLogin}
                    disabled={!validNumber}
                />}
                 {validNumber && <Button
                    title="LOGIN"
                    buttonStyle={styles.buttonStyle}
                    onPress={handleLogin}
                    // disabled={!validNumber}
                />}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    backgroundImage: {
        flex: 1,
        resizeMode: 'cover',
        position: 'absolute',
        width: '100%',
        height: '100%',
    },
    formContainer: {
        // backgroundColor: 'rgba(255, 255, 255, 0.7)',
        borderRadius: 10,
        padding: 20,
        marginHorizontal: 20,
        marginTop: '50%',
    },
    flagStyle: {
        width: 40,
        height: 30,
    },
    textStyle: {
        fontSize: 18,
        fontWeight: '500',
        color: '#333',
    },
    buttonStyle: {
        backgroundColor: allCategoryPink,
        borderRadius: 20,
        marginTop: 40,
    },
    errorText: {
        color: 'red',
        fontSize: 18,
        marginTop: 10,
    },
});


const mapStateToProps = (state) => {
    // console.log("redux state : ", state)
    return {

    }
};
const mapDispatchToProps = (dispatch) => {
    return {
        dispatch,
        ...bindActionCreators({ setPopup }, dispatch),
    }

}

const OTPLogin = connect(mapStateToProps, mapDispatchToProps)(OTPLoginScreen);
export default OTPLogin;
