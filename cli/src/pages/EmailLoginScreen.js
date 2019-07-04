// app/LoginScreen.js
import React, { Component } from 'react';
import axios from 'axios';
import utils from '../common/utils';
import configs from '../common/configs';

import { connect } from 'react-redux';
import { setToken } from '../actions/auth';
import Loader from '../components/Loader'

import {AsyncStorage} from 'react-native';

import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Button,
  TouchableOpacity,
  Image,
  Alert
} from 'react-native';
import { Actions } from 'react-native-router-flux'; // New code

class EmailLoginScreen extends Component<Props> {
  constructor(props) {
    super(props);
    this.state = { username: '', password: '', loading: false, };
  }

  storeData = async (token) => {
    try {
      await AsyncStorage.setItem('Token', token);
    } catch (error) {
    }
  };

  onPressLoginButton = () => {
    const { email, password} = this.state;
    
    this.setState({loading: true});

    axios.post(utils.makeurls('/api/auth/login'), {email, password})
    .then(res => {
      this.setState({loading: false}); 
      this.storeData(res.data.token);

      this.props.setToken(res.data.token);

      Actions.reset('main');
    })
    .catch((err) => {
      this.setState({loading: false});
      Alert.alert('알람', '로그인에 실패하였습니다!',   [
        {text: '확인', onPress: () => {}},
      ],);
    });
  }

  render() {
    return (
            <View style={styles.container}>
            <Loader loading={this.state.loading} />
            <View style={styles.layout}>
                <View style={{ padding: 10 }}></View>
                <Image style={{ width: 100, height: 100, resizeMode: 'stretch', marginBottom: 20 }} source={require('../../resources/imgs/Vlap.png')}/>
                <TextInput style={styles.text} onChangeText={(email)=>{this.setState({email})}} value={this.state.email}
                placeholder="이메일" placeholderTextColor="#FFFFFF"/>
                <TextInput style={styles.text} onChangeText={(password)=>{this.setState({password})}} value={this.state.password}
                secureTextEntry={true} placeholder="비밀번호" placeholderTextColor="#FFFFFF"/>
                <TouchableOpacity style={styles.register} onPress={this.onPressLoginButton}>
                <Text style={{ textAlign: 'center', fontSize: 14, color: '#FFFFFF' }}>로그인</Text></TouchableOpacity>
            </View>
            </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
      flex: 1,
      backgroundColor: '#FFFFFF'
  },
  layout: {
      alignItems: 'center',
      marginTop: 50,
      marginLeft: 60,
      marginRight: 60
  },
  text: {
      textAlign: 'center',
      backgroundColor: '#DDDDDD',
      fontSize: 14,
      width: '80%',
      padding: 5,
      borderRadius: 20,
      marginBottom: 10
  },
  register: {
      width: '80%',
      marginTop: 50,
      backgroundColor: '#F39F95',
      padding: 10,
      borderRadius: 20
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

export default connect(mapStateToProps, mapDispatchToProps)(EmailLoginScreen);