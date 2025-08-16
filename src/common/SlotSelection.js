// src/components/SlotSelection.js
import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { allCategoryPink } from './colours';
import RadioButton from './RadioButton';

const SlotSelection = ({ day, selectedSlot, setSelectedSlot, setSelectedDay }) => {
  let data = day.TIME_SLOT && day.TIME_SLOT.filter((item) => item.slot_available === "1")
  if (!data || data.length === 0)
    return null;
  return (
    <View style={styles.container}>
      <Text style={styles.dayText}>{day.DATE_STRING} - {day.sDATE}</Text>
      <FlatList
        data={data}
        //numColumns={3}
        horizontal={true}
        keyExtractor={(item) => item.ID}
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          item.slot_available === '1' ? <TouchableOpacity
            onPress={() => {
              setSelectedSlot(item)
              setSelectedDay(day.sDATE)
            }}
            style={{ ...styles.slotItem, borderColor: selectedSlot && selectedSlot.ID === item.ID ? allCategoryPink : '#a1a1a1', borderWidth: 1 }}>
            <RadioButton
              isSelected={selectedSlot && selectedSlot.ID === item.ID ? true : false}
            />

            <Text style={{ ...styles.slotText, color: selectedSlot && selectedSlot.ID === item.ID ? allCategoryPink : '#a1a1a1' }}>{item.TIME_DETAILS}</Text>
          </TouchableOpacity> : null
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
    paddingHorizontal: 10
  },
  dayText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: allCategoryPink
  },
  slotItem: {
    backgroundColor: '#ffffff',
    padding: 10,
    marginBottom: 5,
    borderRadius: 5,
    margin: 3
  },
  slotText: {
    fontSize: 12,
    alignSelf: 'center'
  },
});

export default SlotSelection;
