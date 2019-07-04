// app/LibraryScreen.js

// 멤버 프로필 화면 (멤버의 지도, 게시물, 태그 확인 가능)

import React, { Component } from 'react';

import axios from 'axios';
import { connect } from 'react-redux';
import utils from '../common/utils';

import {
  StyleSheet,
  View,
  BackHandler,
} from 'react-native';

import { Actions } from 'react-native-router-flux'; // New code

import Profile from '../components/Profile';
import MemberPostScreen from './MemberPostScreen';

import { setPostInfo, setTag } from '../actions/board';
import { setMemberInfo } from '../actions/member';

import Icon from 'react-native-vector-icons/Ionicons';

class ProfileScreen extends Component<Props> {

  static navigationOptions = {
    tabBarIcon: ({ tintColor }) => (
        <Icon name="ios-list" size={30} color={tintColor}/>
    )
  }

  constructor(props) {
    super(props);
  }

  handleBackPress = () => {
    //alert('hi');
    //console.log(Actions.currentScene);
    if (Actions.currentScene === 'profile') {
      Actions.pop();
      this.props.setMemberInfo({numOfFollowers: 0, numOfPosts:0, nickname:'', profileLink:''});
      return true;
    }
    return false;
    //Actions.pop()
  }

  componentDidMount()
  {
      BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);

      const {setTag, setMemberInfo, memberID, auth: {token}} = this.props;

      setTag('');

      axios.get(utils.makeurls('/api/member/list/' + memberID + '?token=' + token))
      .then((result) => {
        const { memberProfile, numOfFollowers, numOfPosts, isFollowed, me } = result.data;

        setMemberInfo({
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
      });

      axios.get(utils.makeurls('/api/board/post/' + this.props.memberID))
      .then( (result) => {
        const { postInfo } = result.data;
        this.props.setPostInfo(postInfo);
      })
      .catch((err) => {
      });
  }
  
  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.handleBackPress);
  }

  render() {
    return (
      <View style={styles.container}>
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
});

const mapStateToProps = state => {
  return {
    auth: state.auth,
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
export default connect(mapStateToProps, mapDispatchToProps)(ProfileScreen);