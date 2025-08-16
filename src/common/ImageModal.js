import React from 'react';
import { SafeAreaView } from 'react-native';
import { Modal, TouchableOpacity, StyleSheet, Text, View } from 'react-native';
import ImageViewer from 'react-native-image-zoom-viewer';
import { whiteTxtColor } from './colours';

const ImageModal = ({ images, visible, onClose }) => {
    console.log("images for slide:", images)
    return (
        <Modal visible={visible} transparent={false} onRequestClose={onClose}>
            <View style={{ width: '100%', height: '100%',  }} >
                <ImageViewer
                    style={{ width: '100%', height: '80%', }}
                    imageUrls={images} 
                    backgroundColor='white'
                    />
            </View>
            <TouchableOpacity
                style={{ position: 'absolute', top: 60, right: 10, padding: 10 }}
            >
                <Text
                    onPress={() => onClose()}
                    style={{ fontSize: 16, fontFamily: 'Poppins-SemiBold', color: "black", }}
                >Close</Text>
            </TouchableOpacity>

        </Modal>
    );
};

const styles = StyleSheet.create({
    modalBackground: {
        flex: 1,
        backgroundColor: 'red',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 10
    },
});

export default ImageModal;
