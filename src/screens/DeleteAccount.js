import React, { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Modal, StyleSheet, Alert } from "react-native";
import OTPInputView from '@twotalltotems/react-native-otp-input';
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import Header from "../components/Header";
import { server } from "../common/apiConstant";
import { getData, storeData } from "../common/asyncStore";
import { changeAuthState } from "../actions/authAction";
import { changeLoadingState } from "../actions/loadingAction";
import { setPopup } from "../actions/message";
import { allCategoryPink, buttonBgColor, categorySaperator, textColor, whiteTxtColor } from "../common/colours";

function DeleteAccountScreen(props) {
    const { navigation, changeAuthState, changeLoadingState, setPopup, isLoggedIn } = props;
    const [mobile, setMobile] = useState("");
    const [hash, setHash] = useState(null);
    const [otp, setOtp] = useState("");
    const [showOtpDialog, setShowOtpDialog] = useState(false);

    useEffect(() => {
        prefillMobile();
    }, []);

    const prefillMobile = async () => {
        try {
            const loginData = await getData("loginData");
            if (loginData) {
                const user = JSON.parse(loginData);
                const savedMobile = user?.MOBILE_NUMBER || user?.mobile || "";
                if (savedMobile) {
                    setMobile(String(savedMobile).replace("+91", ""));
                }
            }
        } catch (e) {
            console.log("prefillMobile error", e);
        }
    };

    const isValidMobile = () => {
        return mobile && /^[6-9]\d{9}$/.test(mobile.trim());
    };

    const doLogout = () => {
        storeData("loginData", "");
        storeData("isLogin", "false");
        changeAuthState(false);
        if (isLoggedIn) {
            navigation.navigate("HomeStack");
        } else if (navigation.canGoBack()) {
            navigation.goBack();
        } else {
            navigation.navigate("OTPLogin");
        }
    };

    const requestDeleteAccount = () => {
        const cleanMobile = mobile.trim();
        if (!isValidMobile()) {
            setPopup({ message: "Please enter a valid 10-digit mobile number", status: "faliure", open: true });
            return;
        }
        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        var raw = JSON.stringify({ mobile: cleanMobile });
        console.log("deleteAccountRequest : ", `${server}deleteAccountRequest`, raw);

        var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: raw,
            redirect: 'follow'
        };

        changeLoadingState(true);
        fetch(`${server}deleteAccountRequest`, requestOptions)
            .then(response => response.json())
            .then(result => {
                changeLoadingState(false);
                console.log("deleteAccountRequest result : ", result);
                if (result && result.status) {
                    const returnedHash = result?.data?.hash;
                    if (returnedHash) {
                        setHash(returnedHash);
                    }
                    setOtp("");
                    setShowOtpDialog(true);
                    setPopup({ message: result.message || "OTP has been sent to your mobile number", status: "success", open: true });
                } else {
                    setPopup({ message: result?.message || "Unable to send OTP. Please try again.", status: "faliure", open: true });
                }
            })
            .catch(error => {
                changeLoadingState(false);
                console.log('deleteAccountRequest error', error);
                setPopup({ message: "Something went wrong. Please try again.", status: "faliure", open: true });
            });
    };

    const verifyDeleteAccount = () => {
        const cleanMobile = mobile.trim();
        if (!otp || otp.length < 4) {
            setPopup({ message: "Please enter the OTP received on your phone", status: "faliure", open: true });
            return;
        }
        if (!hash) {
            setPopup({ message: "Session expired. Please request OTP again.", status: "faliure", open: true });
            return;
        }
        Alert.alert(
            "Warning",
            "All your data will be lost. Do you want to continue?",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Yes, Continue", style: "destructive", onPress: () => executeVerifyDeleteAccount(cleanMobile) },
            ],
            { cancelable: true }
        );
    };

    const executeVerifyDeleteAccount = (cleanMobile) => {
        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        var raw = JSON.stringify({
            mobile: cleanMobile,
            otp: otp,
            hash: hash
        });
        console.log("verifyDeleteAccount : ", `${server}verifyDeleteAccount`, raw);

        var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: raw,
            redirect: 'follow'
        };

        changeLoadingState(true);
        fetch(`${server}verifyDeleteAccount`, requestOptions)
            .then(response => response.json())
            .then(result => {
                changeLoadingState(false);
                console.log("verifyDeleteAccount result : ", result);
                if (result && result.status) {
                    setShowOtpDialog(false);
                    setPopup({ message: result.message || "Your account has been deleted successfully.", status: "success", open: true });
                    // Small delay so user can read the success popup before logout redirects
                    setTimeout(() => {
                        doLogout();
                    }, 800);
                } else {
                    setPopup({ message: result?.message || "OTP verification failed. Please try again.", status: "faliure", open: true });
                }
            })
            .catch(error => {
                changeLoadingState(false);
                console.log('verifyDeleteAccount error', error);
                setPopup({ message: "Something went wrong. Please try again.", status: "faliure", open: true });
            });
    };

    return (
        <View style={{ flex: 1, backgroundColor: whiteTxtColor }}>
            <Header navigation={navigation} name={"Delete Account"} />
            <View style={{ padding: 20 }}>
                <Text style={{ fontFamily: 'Poppins-SemiBold', fontSize: 16, color: textColor }}>
                    Enter your registered mobile number
                </Text>
                <Text style={{ fontFamily: 'Poppins-Regular', fontSize: 13, color: 'gray', marginTop: 5 }}>
                    We will send an OTP to verify before permanently deleting your account.
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: categorySaperator, borderRadius: 10, marginTop: 20, paddingHorizontal: 10 }}>
                    <Text style={{ fontFamily: 'Poppins-SemiBold', color: textColor, fontSize: 16 }}>+91</Text>
                    <TextInput
                        value={mobile}
                        onChangeText={(text) => setMobile(text.replace(/[^0-9]/g, ''))}
                        keyboardType="phone-pad"
                        maxLength={10}
                        placeholder="Enter mobile number"
                        placeholderTextColor="gray"
                        style={{ flex: 1, marginLeft: 10, fontSize: 16, fontFamily: 'Poppins-Regular', color: textColor, paddingVertical: 12 }}
                    />
                </View>
                <TouchableOpacity
                    onPress={requestDeleteAccount}
                    style={{ backgroundColor: buttonBgColor, padding: 12, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginTop: 25 }}
                >
                    <Text style={{ color: whiteTxtColor, fontFamily: 'Poppins-SemiBold', fontSize: 16 }}>{"Submit"}</Text>
                </TouchableOpacity>
                <View style={{ marginTop: 20, backgroundColor: '#FFF1F4', borderRadius: 10, padding: 12 }}>
                    <Text style={{ fontFamily: 'Poppins-Regular', fontSize: 12, color: '#B0003A' }}>
                        Warning: deleting your account is permanent and you will be logged out immediately after verification.
                    </Text>
                </View>
            </View>

            <Modal
                visible={showOtpDialog}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowOtpDialog(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalBox}>
                        <Text style={{ fontFamily: 'Poppins-SemiBold', fontSize: 18, color: textColor, alignSelf: 'center' }}>
                            Enter OTP
                        </Text>
                        <Text style={{ fontFamily: 'Poppins-Regular', fontSize: 13, color: 'gray', alignSelf: 'center', marginTop: 5, textAlign: 'center' }}>
                            {`OTP sent to +91 ${mobile}`}
                        </Text>
                        <OTPInputView
                            style={{ width: '90%', height: 90, alignSelf: 'center' }}
                            pinCount={6}
                            autoFocusOnLoad
                            code={otp}
                            onCodeChanged={(code) => setOtp(code)}
                            codeInputFieldStyle={styles.otpBox}
                            codeInputHighlightStyle={styles.otpBoxActive}
                        />
                        <TouchableOpacity
                            onPress={verifyDeleteAccount}
                            style={{ backgroundColor: allCategoryPink, borderRadius: 10, paddingVertical: 12, marginTop: 10 }}
                        >
                            <Text style={{ color: whiteTxtColor, fontFamily: 'Poppins-SemiBold', fontSize: 16, alignSelf: 'center' }}>Verify & Delete Account</Text>
                        </TouchableOpacity>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 15 }}>
                            <TouchableOpacity onPress={requestDeleteAccount}>
                                <Text style={{ fontFamily: 'Poppins-SemiBold', color: allCategoryPink }}>Resend OTP</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => setShowOtpDialog(false)}>
                                <Text style={{ fontFamily: 'Poppins-SemiBold', color: textColor }}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        padding: 20,
    },
    modalBox: {
        width: '100%',
        backgroundColor: 'white',
        borderRadius: 15,
        padding: 20,
    },
    otpBox: {
        width: 42,
        height: 48,
        borderRadius: 10,
        backgroundColor: '#ffffff',
        color: '#000000',
        borderWidth: 1,
        borderColor: categorySaperator,
    },
    otpBoxActive: {
        borderColor: allCategoryPink,
    },
});

const mapStateToProps = (state) => {
    return {
        isLoggedIn: state.auth.isLoggedIn,
    };
};
const mapDispatchToProps = (dispatch) => {
    return {
        dispatch,
        ...bindActionCreators({ changeAuthState, changeLoadingState, setPopup }, dispatch),
    };
};

const DeleteAccount = connect(mapStateToProps, mapDispatchToProps)(DeleteAccountScreen);
export default DeleteAccount;
