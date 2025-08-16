import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, LayoutAnimation, TextInput } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import { ratingBackground, screenBgColor, textColor, textInputColor, whiteTxtColor } from './colours';
import { Rating, AirbnbRating } from 'react-native-ratings';
import { getData } from './asyncStore';
import { server } from './apiConstant';

const Accordion = (props) => {
  const { data, reviews, product,changeLoadingState } = props;
  const [expandedSection, setExpandedSection] = useState(null);
  const webviewRef = useRef(null);
  const [contentHeight, setContentHeight] = useState(0);
  const [review, setReview] = useState("")
  const [rating, setRating] = useState("")
  const [error, setError] = useState({})

  const handleWebViewMessage = (event) => {
    const height = parseInt(event.nativeEvent.data, 10);
    setContentHeight(height);
  };
  const toggleSection = (index) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (expandedSection === index) {
      setExpandedSection(null);
    } else {
      setExpandedSection(index);
    }
  };
  const injectJavaScript = `
  const height = Math.max(document.documentElement.clientHeight, document.body.scrollHeight, document.documentElement.scrollHeight, document.body.offsetHeight, document.documentElement.offsetHeight);
  window.ReactNativeWebView.postMessage(height.toString());
`;
  const addReviewToProduct = async () => {
    const loginData = await getData("loginData")
    const userData = JSON.parse(loginData)
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Cookie", "ci_session=d12266efe52fe59bf88f72d453bb47492c482d84");
    let errorObject = {}

    let valid = true

    // if (!name) {
    //   errorObject = { ...errorObject, "name": "Mandatory" }
    //   valid = false
    // }
    // if (!email) {
    //   errorObject = { ...errorObject, "email": "Mandatory" }
    //   valid = false
    // }
    if (!review) {
      errorObject = { ...errorObject, "review": "Mandatory" }
      valid = false
    }
    if (!valid) {
      setError(errorObject)
      return;
    } else {
      setError({})
    }

    var raw = JSON.stringify({
      "user_id": userData?.USER_ID,
      "product_id": product.id,
      "name": '',
      "email": '',
      "reting": "" + rating,
      "review": review
    });
    console.log("raw", raw)
    //return;
    var requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: raw,
      redirect: 'follow'
    };
    changeLoadingState(true)

    fetch(`${server}addproductreview`, requestOptions)
      .then(response => response.json())
      .then(result => {
        changeLoadingState(false)

        console.log(result)
        if (result && result.status) {
          // setName("")
          // setEmail("")
          setReview("")
        }
        alert(result.message)
      })
      .catch(error => {
        console.log('error', error)
        changeLoadingState(false)
      });
  }
  return (
    <View style={styles.container}>
      {data.map((section, index) => (
        <View key={index} style={styles.section}>
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => toggleSection(index)}
          >
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <AntDesign
              name={expandedSection === index ? 'up' : 'down'}
              size={16}
              color="#000"
            />
          </TouchableOpacity>
          {expandedSection === index && (
            section.type === 'review' ?
              reviews && <View style={{ width: '100%', marginTop: 10, backgroundColor: whiteTxtColor, paddingBottom: reviews && reviews.length > 0 ?20:0, paddingTop: reviews && reviews.length > 0? 20:0 }}>
                {reviews && reviews.length > 0 && <Text
                  style={{ fontSize: 20, color: textColor, fontFamily: 'Poppins-Medium', marginLeft: 10, }}
                >{"Reviews"}</Text>}
                {reviews && reviews.length > 0 && <View style={{ width: "95%", height: 1, backgroundColor: screenBgColor, alignSelf: 'center', marginVertical: 20 }}></View>}
                {reviews && reviews.length > 0 && reviews.map((item, index) => {
                  return <View
                    key={'' + index}
                    style={{ marginLeft: 10, }}>
                    <Text
                      style={{ fontSize: 16, color: textColor, fontFamily: 'Poppins-SemiBold', }}
                    >{item.name}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
                      <View style={{ backgroundColor: ratingBackground, paddingHorizontal: 15, paddingVertical: 5, borderRadius: 20 }}>
                        {<View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                          <AntDesign name="star" size={24} color={whiteTxtColor} />
                          <Text
                            style={{ fontSize: 16, color: whiteTxtColor, fontFamily: 'Poppins-SemiBold', marginLeft: 10 }}
                          >{item.reting}</Text>
                        </View>}
                      </View>
                      <Text
                        style={{ fontSize: 16, color: textColor, fontFamily: 'Poppins-Regular', marginLeft: 10 }}
                      >{item.rating_status}</Text>
                    </View>
                    <Text
                      style={{ fontSize: 16, color: textColor, fontFamily: 'Poppins-Regular', marginTop: 10 }}
                    >{item.review}</Text>
                  </View>
                })}

                <Text
                  style={{ fontSize: 18, color: textColor, fontFamily: 'Poppins-SemiBold', marginLeft: 10, marginTop: 20 }}
                >{"Submit Your Review"}</Text>

                <Text
                  style={{ fontSize: 12, color: textColor, fontFamily: 'Poppins-Regular', marginTop: 10, marginLeft: 10 }}
                >{"Your email address will not be published. Required fields are marked*"}</Text>

                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
                  <Text
                    style={{ fontSize: 12, color: textColor, fontFamily: 'Poppins-Regular', marginLeft: 10, alignSelf: 'center' }}
                  >{"Your rating of this product"}</Text>
                  <Rating
                    type='custom'
                    ratingCount={5}
                    imageSize={20}
                    onFinishRating={(rating) => setRating(rating)}
                    startingValue={0}
                    style={{ alignSelf: 'center', marginLeft: 10 }}
                  />
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10, justifyContent: 'space-evenly' }}>
                </View>
                <ValidationView
                  name="review"
                  value={review}
                  error={error}
                  inputComponent={<TextInput
                    value={review}
                    onChangeText={(text) => setReview(text)}

                    placeholderTextColor={textInputColor}
                    multiline={true}
                    style={{ color: textInputColor, flex: .95, paddingVertical: 10, paddingHorizontal: 20, height: 100, borderColor: screenBgColor, borderWidth: 1, marginTop: 20 }}
                    placeholder="Write your review here *"
                  />}
                />


                <TouchableOpacity
                  onPress={addReviewToProduct}
                  style={{ paddingHorizontal: 20, paddingVertical: 10, borderWidth: 1, borderColor: textColor, width: "30%", justifyContent: 'center', alignItems: 'center', borderRadius: 5, margin: 10 }}>
                  <Text style={{ color: textColor }}>Submit</Text>
                </TouchableOpacity>
              </View>
              :
              <View style={{ ...styles.sectionContent }}>
                <WebView
                  ref={webviewRef}
                  style={{ flex: 1, height: 150 }}
                  javaScriptEnabled={true}
                  injectedJavaScript={injectJavaScript}
                  onMessage={handleWebViewMessage}
                  scrollEnabled={true}
                  nestedScrollEnabled={true}
                  source={{ html: '<html><head><meta name="viewport" content="width=device-width, initial-scale=1.0"></head><body>' + section.content + '</body></html>' }}
                />
              </View>
          )}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 0,
    backgroundColor: '#fff',
  },
  section: {
    marginBottom: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingRight: 10,
    paddingVertical: 8,
    borderRadius: 5,
    borderBottomColor: 'gray',
    borderBottomWidth: 1
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  sectionContent: {
    marginTop: 5,
    paddingHorizontal: 10,
    paddingVertical: 8,
    //borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
  sectionText: {
    fontSize: 14,
  },
});

export default Accordion;
