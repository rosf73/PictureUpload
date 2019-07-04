// 프로필 정보 출력 컴포넌트

import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  Image,
  Text,
  Button,
} from 'react-native';

import utils from '../common/utils';

import axios from 'axios';

import { connect } from 'react-redux';

import { setMemberInfo } from '../actions/member';
import { setFollowingMemberList, setFollowingPostList } from '../actions/following';

import { Actions } from 'react-native-router-flux'; // New code

class Profile extends Component<Props> {
  constructor(props) {
    super(props);
  }

  onPress = () => {
    const { isFollowed, numOfFollowers, id} = this.props.member.memberInfo;
    const { setFollowingMemberList, setFollowingPostList, auth: {token}} = this.props;

    const delta = this.props.member.memberInfo.isFollowed ? -1 : 1;

    this.props.setMemberInfo({
      ...this.props.member.memberInfo,
      isFollowed: !isFollowed,
      numOfFollowers: numOfFollowers + delta,
    });

    axios.post(utils.makeurls('/api/member/follow/' + id + '?token=' + token))
    .then((result) => {
      //alert('Success!');
      //console.log('SUCCESS!!');
      // follow 이후 구독자 목록을 불러와 업데이트
      axios.get(utils.makeurls('/api/board/me/followingspost?token=' + token))
      .then((result) => {
        setFollowingMemberList(result.data.myfollow);
        setFollowingPostList(result.data.post);
      })
      .catch((err) => {
      });

    })
    .catch((err) => {
    });
  }
  
  onPressProfile = () => {
    Actions.profilemodification();
  }

  render() {
    const { profileLink, nickname, numOfFollowers, numOfPosts, isFollowed, me, id } = this.props.member.memberInfo;
    
    const title = isFollowed ? "구독 취소" : "구독 하기";
    const button = me ? <Button title="프로필 수정하기" color="#F49F96" onPress={this.onPressProfile}/> : <Button title={title} color="#F49F96" onPress={this.onPress}/>
    
    return (
    <View style={styles.profilebox}>

        <View style={styles.memberbox}>
        <Image
          style={styles.profileimage} 
          source={{uri: utils.makeurls('/' + profileLink)}}
        />
        <Text
          color="#000000"
        >
          {nickname}
        
        </Text>
        </View>

        <View style={styles.infobox}>
        <View style={styles.text_container}>
        <Text style={styles.text_info}>
              {numOfPosts + '\n브이랩'}
        </Text>
        <Text style={styles.text_info}>
              {numOfFollowers + '\n구독자'}
        </Text>
        </View>
          {button}
        </View>
    </View>
  )
  }
}

const styles = StyleSheet.create({
  profilebox: {
    height:100,
    flexDirection: 'row',
    margin:10
  },
  memberbox: {
    flex:1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center'
  },
  infobox: {
    flex:1,
    flexDirection: 'column',
    justifyContent: 'center',
  },
  text_container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems:'center',
  },
  text_info: {
    textAlign:'center'
  },
  profileimage: {
    height: 80,
    width: 80,
    borderRadius: 40,
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
    setFollowingMemberList: (memberList) => dispatch(setFollowingMemberList(memberList)),
    setFollowingPostList: (postList) => dispatch(setFollowingPostList(postList)),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Profile);