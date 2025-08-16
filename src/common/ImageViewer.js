import React from 'react';
import { Modal, TouchableOpacity, StyleSheet } from 'react-native';
import ImageViewer from 'react-native-image-zoom-viewer';

const ImageModal = ({ images, visible, onClose }) => {
  return (
    <Modal visible={visible} transparent={true} onRequestClose={onClose}>
      <TouchableOpacity style={styles.modalBackground} onPress={onClose}>
        <ImageViewer imageUrls={images} />
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ImageModal;
