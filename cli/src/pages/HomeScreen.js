// 홈 스크린

const FBSDK = require('react-native-fbsdk');
const CryptoJS = require("crypto-js");

import React, { Component } from 'react';
import MapView from 'react-native-maps'
import { Marker } from 'react-native-maps';

import axios from 'axios';
import configs from '../common/configs';
import { connect } from 'react-redux';
import utils from '../common/utils';

import {AsyncStorage} from 'react-native';

import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Button,
  Image
} from 'react-native';

import { Actions } from 'react-native-router-flux'; // New code
//import Navbar from '../components/Navbar';
//import Header from '../components/Header';

import { setToken } from '../actions/auth';

import Icon from 'react-native-vector-icons/Ionicons';

const {LoginButton, ShareDialog, AccessToken, GraphRequest, GraphRequestManager} = FBSDK;

class HomeScreen extends Component<Props> {

  static navigationOptions = {
    tabBarIcon: ({ tintColor }) => (
        <Icon name="md-home" size={30} color={tintColor}/>
    )
  }
  
  constructor(props) {
    super(props);

    this.state = {
      latitude: 42.882004,
      longitude: 74.582748,
      postList: [],
    };

   this.retrieveData();
  }

  retrieveData = async () => {
    try {
      const value = await AsyncStorage.getItem('Token');
      if (value !== null) { // 토큰이 존재할 경우 토큰을 props에 등록
        this.props.setToken(value);
        //console.log(value);
        return value;
      }
    } catch (error) {
      return null;
    }
  };

  componentDidMount() {
    //alert('Token:' + this.props.auth.token);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.setState({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          error: null,
        });
      },
      (error) => this.setState({ error: error.message }),
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 },
    );

    axios.get(utils.makeurls('/api/board/post'))
    .then((result) => {
      //console.log('in /board/post');
      //console.log(result);
      //console.log(result.data.post);
      this.setState({postList: result.data.post});
    })
    .catch((err) => {
      //console.log(err);
    });
  }

  postListToMarkerList = (postList) => {
    return postList.map( (post, key) => {

      //console.log(utils.makeurls(post.postMarkerLink));
      
      const onPressMarker = () => {
        Actions.detailpost({postid: post._id, contentsList: post.contentsList, contentsType: post.contentsList[0].contentsType})
      }

      //console.log("뀨뀨뀨뀨");
      //console.log(onPressMarker);

      return <Marker
        key={key}
        coordinate={{"latitude":post.geo[0], "longitude":post.geo[1]}}
        title={'hi'}
        description={'hi2'}
        onPress={onPressMarker}
      >
        <View
          style={styles.markerImgContainer}
        >
          <Image
            style={styles.markerimage} 
            source={{uri: utils.makeurls('/' + post.postMarkerLink)}}
          />
        </View>
      </Marker>
    });
  }

  render() {
    return (
      <View style={styles.container}>
        <MapView
          style={{flex: 10}}
          region={{
            latitude: 12.32,
            longitude: 32.33,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421
          }}
          showsUserLocation={true}>
            {this.postListToMarkerList(this.state.postList)}
        </MapView>
      </View>
    );
  }

  //Create response callback.
  _responseInfoCallback = (error, result) => {
    if (error) {
      //alert('Error fetching data: ' + error.toString());
    } else {
      //alert('Result Name: ' + result.name);
      //alert('Result Id: ' + result.id);
      //alert('Result Email: ' + result.email);
      const profile = JSON.stringify(result);
      //alert(profile);
      //console.log('Profile');
      //console.log(profile);

      const cipherProfile = CryptoJS.AES.encrypt(profile, configs.CRYPTOKEY);
      //alert(cipherProfile.toString());
      //console.log(cipherProfile.toString());

      axios.post(utils.makeurls('/api/auth/flogin'), { cipherProfile: cipherProfile.toString() })
      .then(res => {
        const response = JSON.stringify(res.data);
        //alert(response);
        this.props.setToken(res.data.token);
        //alert(res.data.token);
      })
      .catch((err) => {
        //alert(err);
        //console.log(err);
      });

      //Actions.reset('home');
    }
  }  
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
    color: '#ffffff',
  },
  markerImgContainer: {
    marginLeft: 8,
    height: 40,
    width: 40,
    borderRadius: 20,
  },
  markerimage: {
    height: 40,
    width: 40,
    borderRadius: 20,
  }
});

const mapStateToProps = state => {
  return {
    auth: state.auth
  }
}

const mapDispatchToProps = dispatch => {
  return {
    setToken: (token) => dispatch(setToken(token)),
  }
}

//export default HomeScreen;
export default connect(mapStateToProps, mapDispatchToProps)(HomeScreen);