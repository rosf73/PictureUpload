// app/LoginScreen.js
const FBSDK = require('react-native-fbsdk');
const CryptoJS = require("crypto-js");

import React, { Component } from 'react';
import axios from 'axios';
import utils from '../common/utils';
import configs from '../common/configs';

import { connect } from 'react-redux';
import { setToken } from '../actions/auth';
import { LoginManager } from "react-native-fbsdk";

import {
  StyleSheet,
  Text,
  View,
  Image,
  Button,
  Alert,
  TouchableNativeFeedback
} from 'react-native';

import { Actions } from 'react-native-router-flux'; // New code

import {AsyncStorage} from 'react-native';

const {LoginButton, ShareDialog, AccessToken, GraphRequest, GraphRequestManager} = FBSDK;

class LoginScreen extends Component<Props> {
  constructor(props) {
    super(props);
    
    LoginManager.logOut();
  }
  
  onPressEmailLogin = () => {
    const { username, password} = this.state;
    Actions.emaillogin();
  }

  render() {
    return (
      <View style={styles.container}>
        <TouchableNativeFeedback 
                onPress={()=>{Actions.reset('main');}}
                background={TouchableNativeFeedback.Ripple("", true)}>
        <Image style={{ width: 150, height: 150, resizeMode: 'stretch', marginBottom: 40 }} source={require('../../resources/imgs/Picup.png')}/>
        </TouchableNativeFeedback>
        <LoginButton
          onLoginFinished={
            (error, result) => {
              if (error) {
                Alert.alert('알람', '로그인에 실패하였습니다!',   [
                  {text: '확인', onPress: () => {}},
                ],);
              } else if (result.isCancelled) {
                Alert.alert('알람', '로그인을 취소하였습니다!',   [
                  {text: '확인', onPress: () => {}},
                ],);
              } else {
                AccessToken.getCurrentAccessToken().then(
                  (data) => {
                    meow_accesstoken = data.accessToken;
                    const infoRequest = new GraphRequest(
                      //'/me?fields=name,picture,email,id,birthday,gender',
                      //null,
                      '/me',
                      {
                        parameters: {
                          fields: {
                            string: 'name,picture,email,id,birthday,gender' // what you want to get
                          },
                          access_token: {
                            string: meow_accesstoken.toString() // put your accessToken here
                          }
                        }
                      },
                      this._responseInfoCallback
                    );
                    new GraphRequestManager().addRequest(infoRequest).start();
                  }
                )
              }
            }
          }
          onLogoutFinished={() => {}}/>

        <View style={styles.loginbutton}>
        <Button
          onPress={() => Actions.emaillogin()} // New Code
          title="이메일로 로그인하기"
          style={styles.loginbutton}
          color="#F49F96"
        >
          <Text style={{color: '#ff0000'}}/>
        </Button>
        </View>
        
        <Text onPress={() => Actions.register()} color="#000000">회원가입</Text>
      </View>
    );
  }

  //Create response callback.
  _responseInfoCallback = (error, result) => {
    if (error) {
      Alert.alert('알람', '로그인에 실패하였습니다!',   [
        {text: '확인', onPress: () => {}},
      ],);
    } else {
      const profile = JSON.stringify(result);
      const cipherProfile = CryptoJS.AES.encrypt(profile, configs.CRYPTOKEY);

      axios.post(utils.makeurls('/api/auth/flogin'), { cipherProfile: cipherProfile.toString() })
      .then(res => {
        const response = JSON.stringify(res.data);

        this.props.setToken(res.data.token);
        
        utils.storeToken(res.data.token);

        Actions.reset('main');
      })
      .catch((err) => {
        Alert.alert('알람', '로그인에 실패하였습니다!',   [
          {text: '확인', onPress: () => {}},
        ],);
        //alert(err.message);
      });
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  loginbutton: {
    height: 30,
    width: 190,
    margin: 20,
  },
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

export default connect(mapStateToProps, mapDispatchToProps)(LoginScreen);