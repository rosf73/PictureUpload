import React, { Component } from 'react';
import axios from 'axios';
import utils from '../common/utils';
import { StyleSheet, View, Text, TextInput, Image, TouchableOpacity, Alert } from 'react-native';
import { Actions } from 'react-native-router-flux';
//import DateTimePicker from 'react-native-modal-datetime-picker'
//import RadioGroup from 'react-native-radio-buttons-group'
import Loader from '../components/Loader'

export default class RegisterScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            picture: null,
            username: '',
            password: '',
            check_password: '',
            email: '',
            nickname:'',
        };
    }

    checkFormat = (str, format) => {
        if(str.match(format)) return true;
        return false;
    }

    isValidName = (name) => {
        //
          if(name.length<2 || name.length > 16){
              return false;
          }
      
          let regx = /[^a-zA-Z0-9|ㄱ-ㅎ|ㅏ-ㅣ|가-힣_]/;
          return !regx.test(name);      // 유효하면 true반환
    }

    isValidPassWord = (str) => {
        var pw = str;
        var num = pw.search(/[0-9]/g);
        var eng = pw.search(/[a-z]/ig);
        var spe = pw.search(/[`~!@@#$%^&*|₩₩₩'₩";:₩/?]/gi);
        let msg;
      
        if(pw.length < 8 || pw.length > 16){
          //alert("8자리 ~ 16자리 이내로 입력해주세요.");
          return false;
        }
      
        if(pw.search(/₩s/) != -1){
          //alert("비밀번호는 공백없이 입력해주세요.");
          //console.log(msg)
          return false;
        }
      
        if(num < 0 || eng < 0 || spe < 0 ){
          //alert("영문,숫자, 특수문자를 혼합하여 입력해주세요.");
          //console.log(msg)
          return false;
        }
        return true;
      }
    
    onPressRegisterButton = () => {
        //let selectedButton = this.state.gender.find(e => e.selected == true);
        //selectedGender = selectedButton ? selectedButton.value : this.state.gender[0].value;

        const { nickname, email, password, check_password } = this.state;

        if (!this.isValidName(nickname)) {
            Alert.alert('알람', '닉네임은 2~16자의 특수문자를 제외한 문자 혹은 숫자로 이루어져야 합니다!',   [
                {text: '확인', onPress: () => {}},
            ],);
            //alert("닉네임은 2~16자의 특수문자를 제외한 문자 혹은 숫자로 이루어져야 합니다");
            return;
        }

        if (email === '') { 
            //alert("이메일을 입력하십시오"); 
            Alert.alert('알람', '이메일을 입력해주세요!',   [
                {text: '확인', onPress: () => {}},
            ],);
            return; 
        }
        if (!this.checkFormat(email, /^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*\.[a-zA-Z]{2,3}$/i)) {
            Alert.alert('알람', '이메일 형식이 잘못되었습니다!',   [
                {text: '확인', onPress: () => {}},
              ],);
            //alert("이메일 형식이 잘못되었습니다");
            return;
        }

        if (!this.isValidPassWord(password)) {
            Alert.alert('알람', '비밀번호는 8~16자의 대·소문자, 특수문자를 포함한 문자 혹은 숫자로 이루어져야 합니다!',   [
                {text: '확인', onPress: () => {}},
            ],);
            //alert("비밀번호는 8~16자의 대·소문자, 특수문자를 포함한 문자 혹은 숫자로 이루어져야 합니다");
            return;
        }
        if (check_password === '') { 
            //alert("비밀번호 확인란을 입력하십시오");
            Alert.alert('알람', '비밀번호 확인란을 입력해주세요!!',   [
                {text: '확인', onPress: () => {}},
            ],);
            return; 
        }
        if (password !== check_password) { 
            //alert("비밀번호 확인란과 비밀번호가 일치하지 않습니다"); 
            Alert.alert('알람', '비밀번호 확인란과 비밀번호가 일치하지 않습니다!',   [
                {text: '확인', onPress: () => {}},
            ],);
            return; 
        }
        
        Alert.alert("가입 확인", "가입 하시겠습니까?",
            [
                { text: "아니오", onPress: () => console.log("Cancel Pressed") },
                { text: "예", onPress: () => { 
                    
                    this.setState({loading: true});

                    axios.post(utils.makeurls('/api/auth/register'), {nickname, email, password})
                    .then(res => {
                        this.setState({loading: false});
                        //console.log('AXIOS POST:', res.data);
                        Actions.pop(); //alert("가입 성공!"); 
                    })
                    .catch((err) => {
                        this.setState({loading: false});
                        //console.log(err);
                        alert('가입에 실패하였습니다.');
                    });
                }}
            ],
            { cancelable: false }
        );
    }
   
    render() {
        return (
            <View style={styles.container}>
                <Loader loading={this.state.loading} />

                <Image style={{ width: 150, height: 150, resizeMode: 'stretch', marginBottom: 40 }} source={require('../../resources/imgs/Vlap.png')}/>
                <TextInput style={styles.text} onChangeText={(nickname)=>{this.setState({nickname})}} value={this.state.nickname}
                placeholder="이름" placeholderTextColor="#FFFFFF"/>
                <TextInput style={styles.text} onChangeText={(email)=>{this.setState({email})}} value={this.state.email}
                placeholder="이메일" placeholderTextColor="#FFFFFF"/>
                <TextInput style={styles.text} onChangeText={(password)=>{this.setState({password})}} value={this.state.password}
                secureTextEntry={true} placeholder="비밀번호" placeholderTextColor="#FFFFFF"/>
                <TextInput style={styles.text} onChangeText={(check_password)=>{this.setState({check_password})}} value={this.state.check_password}
                secureTextEntry={true} placeholder="비밀번호 확인" placeholderTextColor="#FFFFFF"/>

                <TouchableOpacity style={styles.register} onPress={this.onPressRegisterButton}>
                <Text style={{ textAlign: 'center', fontSize: 14, color: '#FFFFFF' }}>회원가입</Text></TouchableOpacity>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center'
    },
    text: {
        textAlign: 'center',
        backgroundColor: '#DDDDDD',
        fontSize: 14,
        width: 270,
        padding: 5,
        borderRadius: 20,
        marginBottom: 10
    },
    register: {
        width: 270,
        marginTop: 30,
        backgroundColor: '#F39F95',
        padding: 10,
        borderRadius: 20
    }
})