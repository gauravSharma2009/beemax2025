import React from 'react';
import { View, Text, Modal, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome'; // You can choose your preferred icon library
import { StyleSheet } from 'react-native';
import { allCategoryPink, whiteTxtColor } from './colours';
import { Image } from 'react-native';

const CustomModal = ({ visible, status, closeModal, message }) => {
    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="slide"
            onRequestClose={closeModal}
        >
            <View style={styles.modalContainer}>
                <View style={{ width: "80%", height: '30%', }}>

                    <View style={{ ...styles.modalContent, }}>
                        <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                            <Icon name="close" size={20} color="#333" />
                        </TouchableOpacity>

                        <Text style={styles.statusMessage}>
                            {message}
                        </Text>
                        <Text style={styles.statusText}>
                            {status === 'success' ? "Successful" : "Failed"}
                        </Text>
                    </View>
                    <View style={styles.statusIcon}>
                        {status === 'success' ? <Image
                            style={{ width: 50, height: 50 }}
                            source={require('../../assets/succ.png')}
                        /> : <Image
                            style={{ width: 50, height: 50 }}
                            source={require('../../assets/error.png')}
                        />}
                        {/* <Image
                            style={{ width: 50, height: 50 }}
                            source={require(status === 'success' ? '../../assets/success.png' : '../../assets/error.png')}
                        /> */}
                        {/* <Icon
                            name={status === 'success' ? 'check-circle' : 'times-circle'}
                            size={50}
                            color={status === 'success' ? 'green' : 'red'}
                        /> */}
                    </View>
                    <TouchableOpacity
                        onPress={closeModal}
                        style={{ position: 'absolute', backgroundColor: allCategoryPink, paddingVertical: 10, paddingHorizontal: 20, borderRadius: 5, marginVertical: 10, width: '60%', alignSelf: 'center', bottom: 0 }}>
                        <Text style={{ color: whiteTxtColor, fontFamily: 'Poppins-Regular', alignSelf: 'center', fontSize: 18 }}>OK</Text>
                    </TouchableOpacity>
                </View>

            </View>
        </Modal>
    );
};

export default CustomModal;

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: '100%',
        height: '90%',
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 20,
        alignItems: 'center',
        alignSelf: 'flex-end',
        position: 'absolute',
        bottom: 0,
    },
    closeButton: {
        position: 'absolute',
        top: 10,
        right: 10,
    },
    statusIcon: {
      //  marginBottom: 10,
        width: 50,
        height: 50,
        resizeMode: 'center',
        position: 'absolute',
        alignSelf: 'center'
    },
    statusMessage: {
        fontSize: 12,
        textAlign: 'center',
        marginTop: 20,
        fontFamily: 'Poppins-Regular',
        color: '#101010'
    },
    statusText: {
        fontSize: 14,
        textAlign: 'center',
        marginTop: 20,
        fontFamily: 'Poppins-SemiBold',
        color: '#101010'
    },
});