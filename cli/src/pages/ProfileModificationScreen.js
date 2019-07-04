import React from 'react'
import { View, Text, Image, Button, StyleSheet, TextInput, Platform, Alert } from 'react-native'
import ImagePicker from 'react-native-image-picker'

import utils from '../common/utils';

import { connect } from 'react-redux';
import axios from 'axios';

import Loader from '../components/Loader'

import { Actions } from 'react-native-router-flux';

import { setMemberInfo } from '../actions/member';

const BLUE = "#428AF8";
const LIGHT_GRAY = "#D3D3D3"

class ProfileModificationScreen extends React.Component {
  state = {
    profileSetting: false,
    photo: null,
    nickname: '',
    isFocused: false,
    loading: false,
    rotation: 0,
    isSelectedOption1: false,
    isSelectedOption2: false
  }

  handleChoosePhoto = () => {
    const options = {
      noData: true,
      rotation: 360,
    }
    ImagePicker.launchImageLibrary(options, response => {
      if (response.uri) {
        this.setState({ photo: response, profileSetting: true, rotation:response.originalRotation })
      }
    })
  }

  handleChooseClose = () => {
    Actions.pop();
  }

  isValidName = (name) => {
    //
      if(name.length<2 || name.length > 16){
          return false;
      }
  
      let regx = /[^a-zA-Z0-9|ㄱ-ㅎ|ㅏ-ㅣ|가-힣_]/;
      return !regx.test(name);      // 유효하면 true반환
  }

  handleChooseConfirm = () => {
    const data = new FormData();
    const {nickname, photo, profileSetting, rotation} = this.state;
    const {setMemberInfo, auth: {token}} = this.props;

    if (nickname === '' && !profileSetting) {
      Actions.pop();
      return;
    }
    
    this.setState({loading: true});

    if (profileSetting) {
      data.append("profile", {
        name: photo.fileName,
        type: photo.type,
        uri:
          Platform.OS === "android" ? photo.uri : photo.uri.replace("file://", ""),
      });

      if (Platform.OS === "android")
        data.append("isAndroid", true);
      else
        data.append("isAndroid", false);

      data.append("rotation", rotation)
    }

    if (nickname != '') {
      if (!this.isValidName(nickname)) {
        //alert("닉네임은 2~16자의 특수문자를 제외한 문자 혹은 숫자로 이루어져야 합니다");
        Alert.alert('알람', '닉네임은 2~16자의 특수문자를 제외한 문자 혹은 숫자로 이루어져야 합니다!',   [
          {text: '확인', onPress: () => {}},
        ],);
        return;
      }
      data.append("nickname", nickname);
    }

    axios.put(utils.makeurls('/api/member/me?token=' + token), data)
    .then(res => {
        //console.log('AXIOS POST:', res.data);
        var memberInfo = this.props.member.memberInfo;
        const {profileLink, nickname} = res.data;

        memberInfo.profileLink = profileLink;
        memberInfo.nickname = nickname;

        this.props.setMemberInfo(memberInfo);

        this.setState({loading: false});

        Actions.pop(); //alert("가입 성공!"); 
    })
    .catch((err) => {
        this.setState({loading: false});
        //console.log(err);
        //alert('프로필 수정에 실패하였습니다.');
        Alert.alert('알람', '프로필 수정에 실패하였습니다!',   [
          {text: '확인', onPress: () => {}},
        ],);
    });
  }

  render() {
    const { photo, profileSetting, rotation } = this.state
    
    const { profileLink } = this.props.member.memberInfo;
    
    const profileimagestyle = styles.profileimage;

    return (
      <View style={{ flex: 1, alignItems: 'center', backgroundColor:"#FFFFFF" }}>
        <Loader loading={this.state.loading} />
        <View style={styles.header}>    
          <Text style={{ textAlign: 'center', fontSize: 17 }} onPress={this.handleChooseClose}>취소</Text>
          <Text style={styles.title}>프로필 편집</Text>   
          <Text style={{ textAlign: 'center', fontSize: 17 }} onPress={this.handleChooseConfirm}>완료</Text>
        </View>
        
        {profileSetting && (
          <Image
            source={{ uri: photo.uri }}
            style={profileimagestyle} 
          />
        )}
        {!profileSetting && (
          <Image
            source={{uri: utils.makeurls('/' + profileLink)}}
            style={styles.profileimage} 
          />
        )}
        <Text style={{ textAlign: 'center', fontSize: 15, color: '#008AFF' }} onPress={this.handleChoosePhoto}>
        프로필 사진 바꾸기</Text>
                
        <View style={styles.info}>
          <Text style={styles.namelabel}>이름</Text>
          <TextInput onChangeText={(nickname)=>{this.setState({nickname})}} value={this.state.nickname}
            selectionColor={BLUE} underlineColorAndroid={LIGHT_GRAY} style={styles.nameInput}/>
        </View>

      </View>
    )
  }
}

const styles = StyleSheet.create({
  profileimage: {
    height: 120,
    width: 120,
    borderRadius: 100,
    padding:20,
    margin:20
  },
  header: {
    height: 50,
    backgroundColor: '#FFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 15,
    paddingRight: 15,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#CCC'
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 18,
    color: '#333'
  },
  info: {
    margin: 15,
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: LIGHT_GRAY,
    borderTopWidth: 1,
    borderTopColor: LIGHT_GRAY,
    padding: 10,
    width: '100%',
    alignItems:'center'
  },
  nameInput: {
    flex: 1,
    height: 50,
    marginRight: 10,
    fontSize: 16
  },
  namelabel: {
    fontSize: 16,
    color: '#333',
    paddingLeft: 10,
    marginRight: 25
  },
});

const mapStateToProps = state => {
  return {
    member: state.member,
    auth: state.auth,
  }
}

const mapDispatchToProps = dispatch => {
  return {
    setMemberInfo: (memberInfo) => dispatch(setMemberInfo(memberInfo)),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ProfileModificationScreen);