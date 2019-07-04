// app/LibraryScreen.js

// 라이브러리 화면

import React, { Component } from 'react';
import { Marker } from 'react-native-maps';

import axios from 'axios';
import configs from '../common/configs';
import { connect } from 'react-redux';
import utils from '../common/utils';

import {
  StyleSheet,
  View,
} from 'react-native';

import { Actions } from 'react-native-router-flux'; // New code
import Profile from '../components/Profile';

import { setPostInfo, setTag } from '../actions/board';
import { setMemberInfo } from '../actions/member';

import { NavigationEvents } from "react-navigation";

import Icon from 'react-native-vector-icons/Entypo';

import MemberPostScreen from './MemberPostScreen';

class LibraryScreen extends Component<Props> {

  static navigationOptions = {
    tabBarIcon: ({ tintColor }) => (
        <Icon name="box" size={30} color={tintColor}/>
    )
  }

  constructor(props) {
    super(props);

    this.state = {
      latitude: 42.882004,
      longitude: 74.582748,
      postList: [],
      //profileInfo : {numOfFollowers: 0, numOfPosts:0, nickname:''},
    };
  }

  onWillFocus = (payload) => {
    //this.props.setMemberInfo({numOfFollowers: 0, numOfPosts:0, nickname:'', profileLink:'member/basic.jpg'});
    this.props.setPostInfo({}); // 게시물 정보 초기화

    if (!utils.isEmpty(this.props.auth.token)) {
      this.props.setTag('');
      axios.get(utils.makeurls('/api/member/me?token=' + this.props.auth.token))
      .then((result) => {
        const { memberProfile, numOfFollowers, numOfPosts, isFollowed, me } = result.data;
        
        //this.props.setAuth(true);
        //this.props.setMemberID(memberProfile._id); // HotScreen에서 setMemberID를 호출하여 로그인 멤버 정보를 저장함
        
        this.props.setMemberInfo({
          profileLink: memberProfile.profileLink, 
          nickname: memberProfile.nickname,
          numOfFollowers,
          numOfPosts,
          isFollowed,
          me,
          id: memberProfile._id
        });
      })
      .catch((err) => {
        Actions.reset('login');
      });

      axios.get(utils.makeurls('/api/board/me?token=' + this.props.auth.token))
      .then( (result) => {
        const { postInfo } = result.data;
        this.props.setPostInfo(postInfo);
      })
      .catch((err) => {
        Actions.reset('login');
      });
    }
    else {
      Actions.reset('login');
    }
  }
  
  render() {
    return (
      <View style={styles.container}>
        <NavigationEvents
          onWillFocus={this.onWillFocus}
        />
        <Profile/>
        <MemberPostScreen/>
      </View>
    );
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
    auth: state.auth,
    board: state.board
  }
}

const mapDispatchToProps = dispatch => {
  return {
    setPostInfo: (postInfo) => dispatch(setPostInfo(postInfo)),
    setMemberInfo: (memberInfo) => dispatch(setMemberInfo(memberInfo)),
    setTag: (tag) => dispatch(setTag(tag)),
  }
}

//export default HomeScreen;
export default connect(mapStateToProps, mapDispatchToProps)(LibraryScreen);