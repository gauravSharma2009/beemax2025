import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    FlatList,
    Image,
    Alert,
    StyleSheet,
    SafeAreaView,
    StatusBar,
    ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { changeLoadingState } from '../actions/loadingAction';
import { server } from '../common/apiConstant';

const AutoSuggestSearch = (props) => {

    const { navigation, changeLoadingState, pinCode, address, isLoggedIn, appHeaderColor } = props

    const [searchText, setSearchText] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [recentSearches, setRecentSearches] = useState([]);

    // Load recent searches from AsyncStorage on component mount
    useEffect(() => {
        loadRecentSearches();
    }, []);

    // Debounce function to avoid too many API calls
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchText.length > 0) {
                fetchSuggestions(searchText);
            } else {
                setSuggestions([]);
                setShowSuggestions(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [searchText]);

    // Load recent searches from AsyncStorage
    const loadRecentSearches = async () => {
        try {
            const storedSearches = await AsyncStorage.getItem('recentSearches');
            if (storedSearches) {
                setRecentSearches(JSON.parse(storedSearches));
            }
        } catch (error) {
            console.error('Error loading recent searches:', error);
        }
    };

    // Save search term to AsyncStorage
    const saveSearchToStorage = async (searchTerm) => {
        try {
            const trimmedSearch = searchTerm.trim();
            if (trimmedSearch.length === 0) return;

            let updatedSearches = [...recentSearches];

            // Remove if already exists to avoid duplicates
            updatedSearches = updatedSearches.filter(item => item.toLowerCase() !== trimmedSearch.toLowerCase());

            // Add to beginning of array
            updatedSearches.unshift(trimmedSearch);

            // Keep only last 12 searches
            updatedSearches = updatedSearches.slice(0, 12);

            setRecentSearches(updatedSearches);
            await AsyncStorage.setItem('recentSearches', JSON.stringify(updatedSearches));
        } catch (error) {
            console.error('Error saving search to storage:', error);
        }
    };

    const fetchSuggestions = async (keyword) => {
        if (keyword.length < 2) return;
        setLoading(true);

        try {
            const response = await fetch(server + 'autosuggestcategory', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    keyword: keyword,
                    pincode: pinCode
                }),
            });

            const data = await response.json();

            if (data.status && data.data && data.data.aSuggestedCatListData) {
                setSuggestions(data.data.aSuggestedCatListData);
                setShowSuggestions(true);
            } else {
                setSuggestions([]);
                setShowSuggestions(false);
            }
        } catch (error) {
            console.error('Error fetching suggestions:', error);
            setSuggestions([]);
            setShowSuggestions(false);
        } finally {
            setLoading(false);
        }
    };

    const handleSuggestionPress = (item) => {
        // Alert.alert(
        //     'Category Selected',
        //     `You selected: ${item.category_title}\nCategory ID: ${item.category_id}`,
        //     [{ text: 'OK' }]
        // );
        setSearchText("");
        setShowSuggestions(false);
        // Save the selected suggestion to recent searches
        saveSearchToStorage(item.category_title);
        navigation.navigate("ProductListing", { item: { ...item, id: item.category_id } })

    };

    const handleRecentSearchPress = (searchTerm) => {
        setSearchText(searchTerm);
        // Move this search to the top of recent searches
        saveSearchToStorage(searchTerm);
    };

    const clearSearch = () => {
        setSearchText('');
        setSuggestions([]);
        setShowSuggestions(false);
    };

    const renderSuggestionItem = ({ item }) => (
        <TouchableOpacity
            style={styles.suggestionItem}
            onPress={() => handleSuggestionPress(item)}
        >
            <Image
                source={{ uri: item.categry_icon }}
                style={styles.suggestionIcon}
            // defaultSource={require('./placeholder-icon.png')} // Add a placeholder image
            />
            <View style={styles.suggestionTextContainer}>
                <Text style={styles.suggestionNameText}>{item.name || "N/A"}</Text>
                <Text style={styles.suggestionCategoryText}>in {item.category_title}</Text>
            </View>
            <Image
                source={require('../../assets/up-left-arrow.png')}
                style={styles.suggestionArrowIcon}
            />
        </TouchableOpacity>
    );

    const renderRecentSearchChip = (item, index) => (
        <TouchableOpacity
            key={index}
            style={styles.recentSearchChip}
            onPress={() => handleRecentSearchPress(item)}
        >
            <Text style={styles.recentSearchText}>{item}</Text>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            ?
            {/* Header */}
            <View style={{ ...styles.header, backgroundColor: appHeaderColor }}>
                {/* <TouchableOpacity style={styles.backButton}>
                    <Text style={styles.backButtonText}>←</Text>
                </TouchableOpacity> */}
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={{ marginLeft: 0 }}
                >
                    <Image
                        source={require('../../assets/icons/back.png')}
                        style={{ width: 32, height: 32, resizeMode: 'contain', tintColor:'#FFFFFF' }}
                    />
                </TouchableOpacity>
                <View style={styles.searchContainer}>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search for products, brands and more"
                        placeholderTextColor="#999"
                        value={searchText}
                        onChangeText={setSearchText}
                        onSubmitEditing={() => {
                            if (searchText.trim().length > 0) {
                                saveSearchToStorage(searchText);
                            }
                        }}
                        returnKeyType="search"
                        autoFocus={true}
                    />
                    {searchText.length > 0 && (
                        <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
                            <Text style={styles.clearButtonText}>✕</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Content */}
            <View style={styles.content}>
                {/* Suggestions List */}
                {showSuggestions && suggestions.length > 0 && (
                    <View style={styles.suggestionsContainer}>
                        {loading && (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="small" color="#6B46C1" />
                            </View>
                        )}
                        <FlatList
                            data={suggestions}
                            renderItem={renderSuggestionItem}
                            keyExtractor={(item) => item.category_id}
                            style={styles.suggestionsList}
                            showsVerticalScrollIndicator={false}
                        />
                    </View>
                )}

                {/* Spacer to push recent searches to bottom */}
                {<View style={styles.spacer} />}

                {/* Recent Searches - Show at bottom when no suggestions */}
                {recentSearches.length > 0 && (
                    <View style={styles.recentSearchesBottomContainer}>
                        <Text style={styles.recentSearchesTitle}>Recent searches</Text>
                        <View style={styles.recentSearchesContainer}>
                            {recentSearches.map((item, index) => renderRecentSearchChip(item, index))}
                        </View>
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    header: {
        backgroundColor: '#6B46C1',
        paddingHorizontal: 16,
        paddingVertical: 12,
        height:110
        // flexDirection: 'row',
        // alignItems: 'center',
    },
    backButton: {
        marginRight: 12,
    },
    backButtonText: {
        color: 'white',
        fontSize: 24,
        fontWeight: 'bold',
    },
    searchContainer: {
        flex: 1,
        backgroundColor: 'white',
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        marginTop:10
        // height: 44,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#333',
        minHeight:35,
    },
    clearButton: {
        padding: 4,
    },
    clearButtonText: {
        color: '#999',
        fontSize: 18,
    },
    content: {
        flex: 1,
        backgroundColor: 'white',
    },
    spacer: {
        flex: 1,
    },
    suggestionsContainer: {
        backgroundColor: 'white',
        maxHeight: 400,
    },
    loadingContainer: {
        padding: 16,
        alignItems: 'center',
    },
    suggestionsList: {
        backgroundColor: 'white',
    },
    suggestionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    suggestionIcon: {
        width: 40,
        height: 40,
        borderRadius: 6,
        marginRight: 12,
        backgroundColor: '#F8F8F8',
    },
    suggestionTextContainer: {
        flex: 1,
        flexDirection: 'column',
    },
    suggestionNameText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 2,
    },
    suggestionCategoryText: {
        fontSize: 14,
        color: '#2e4fb8',
    },
    suggestionArrowIcon: {
        width: 32,
        height: 32,
        marginLeft: 8,
        // tintColor: '#999',
    },
    recentSearchesBottomContainer: {
        backgroundColor: 'white',
        paddingBottom: 20,
    },
    recentSearchesTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        paddingHorizontal: 16,
        paddingTop: 24,
        paddingBottom: 16,
    },
    recentSearchesContainer: {
        paddingHorizontal: 16,
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    recentSearchChip: {
        backgroundColor: '#F0F0F0',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 12,
        marginBottom: 12,
    },
    recentSearchText: {
        fontSize: 14,
        color: '#666',
    },
});

const mapStateToProps = (state) => {
    // console.log("redux state : ", state.pinCode)
    return {
        isLoading: state.loader.isLoading,
        pinCode: state.pinCode.pincode,
        address: state?.pinCode?.address || "Location",
        appHeaderColor: state.appHeaderColor.appHeaderColor,
        isLoggedIn: state.auth.isLoggedIn
        //isLoading: true

    }
};
const mapDispatchToProps = (dispatch) => {
    return {
        dispatch,
        ...bindActionCreators({ changeLoadingState }, dispatch),
    }

}

const AutoSuggestSearchPage = connect(mapStateToProps, mapDispatchToProps)(AutoSuggestSearch);

export default AutoSuggestSearchPage;