import AsyncStorage from '@react-native-async-storage/async-storage';


export const storeData = (key, value) => {
  //  console.log('Values to save', key + ' : ' + value);
    AsyncStorage.setItem(key, value);
}

export const getData = (key) => {
    //console.log('Key : ' + key);
    return AsyncStorage.getItem(key);
}
export const clearData = (key) => {
   // console.log('clearing storage. ');
    AsyncStorage.clear();
}
