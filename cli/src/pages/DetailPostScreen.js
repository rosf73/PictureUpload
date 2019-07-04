import React, { Component } from 'react';

import TimedSlideshow from 'react-native-timed-slideshow';
import Video from 'react-native-video'

import utils from '../common/utils';

import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Button,
  Image,
  TouchableWithoutFeedback,
  BackHandler,
  Alert,
} from 'react-native';

import { Thumbnail } from 'native-base';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Entypo from 'react-native-vector-icons/Entypo';
import { Actions } from 'react-native-router-flux';

import axios from 'axios';

class DetailPostScreen extends Component<Props> {
  constructor(props) {
    super(props);

    this.state = {
      isFollowing: false,
      isLike: false,
      contentsType: -1,
    };
  }

  _onPressProfile = () => {
    Actions.profile({memberID: this.props.memberID});
  }

  _onPressFollowing = () => {
    const {memberID, token} = this.props;
    const {isFollowing} = this.state;

    if (utils.isEmpty(token)) {
      Alert.alert('알람', '로그인이 필요한 서비스입니다!',   [
        {text: '확인', onPress: () => {Actions.login();}},
        {text: '취소', onPress: () => {}},
      ],);
      return;
    }
     
    axios.post(utils.makeurls('/api/member/follow/' + memberID + '?token=' + token))
    .then((result) => {
      this.setState({ isFollowing: !isFollowing });
    })
    .catch((err) => {
    });
  }

  _onPressLike = () => {
    const {postID, token, decreaseLike, increaseLike} = this.props;
    const {isLike} = this.state;

    if (utils.isEmpty(token)) {
      Alert.alert('알람', '로그인이 필요한 서비스입니다!',   [
        {text: '확인', onPress: () => {Actions.login();}},
        {text: '취소', onPress: () => {}},
      ],);
      return;
    }

    if (this.state.isLike) {
      decreaseLike();
    }
    else {
      increaseLike();
    }

    this.setState({ isLike: !this.state.isLike });
    
    axios.post(utils.makeurls('/api/board/post/like/' + postID + '?token=' + token))
    .then((result) => {
    })
    .catch((err) => {
    });
  }

  _onPressCommentInput = () => {
    const {token, postID, numOfLikes} = this.props;

    if (utils.isEmpty(token)) {
      //alert(this.props.numOfLikes);
      Alert.alert('알람', '로그인이 필요한 서비스입니다!',   [
        {text: '확인', onPress: () => {Actions.login();}},
        {text: '취소', onPress: () => {}},
      ],);
      return;
    }

    Actions.comments({postID, token, numOfLikes});
  }

  _onPressExpand = () => {
    const {contentsType, contentsList, title, text} = this.props;

    Actions.fullscreen({
      contentsType,
      contentsList,
      title,
      text
    });
  }

  componentDidMount() {
    BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);

    const {postID, token} = this.props;

    axios.get(utils.makeurls('/api/board/detail/' + this.props.postID + '?token=' + this.props.token))
    .then((result) => {
      this.setState(
        {
          isLike: result.data.isLiked,
          isFollowing: result.data.isFollowing,
          profileLink: result.data.profileLink,
          nickname: result.data.nickname
        }
      );
    })
    .catch((err) => {
    });
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.handleBackPress);
  }

  getImageURLs = (contentsList) => {
    return contentsList.map( (contents, key) => {
      return {url: utils.makeurls('/' + contents.link)};
    });
  }
  
  getImageURIs = (contentsList) => {
    return contentsList.map( (contents, key) => {
      return {
        uri: utils.makeurls('/' + contents.link),
        title: this.props.title,
        text:this.props.text,
      };
    });
  }

  renderVideo = (contents) => {
    return (
      <Video
        source={{uri: utils.makeurls('/' + contents.link)}}   // Can be a URL or a local file.
        muted={true}
        repeat={true}
        resizeMode={"cover"}
        volume={1.0}
        rate={1.0}
        ignoreSilentSwitch={"obey"}
        style={{
          aspectRatio: 1,
          width: "100%"
        }}
      />
    );
  }

  renderImages = (contentsList) => {
   return (
    <TimedSlideshow
      fullWidth={true}
      showProgressBar={false}
      items={this.getImageURIs(contentsList)}
      />
    )
  }

  handleBackPress = () => {
    if (Actions.currentScene === 'detailpost') {
      Actions.pop();
      return true;
    }
    return false;
  }

  render() {
    const {contentsType, contentsList, memberID, loginMemberID} = this.props;
    const {nickname, profileLink, isLike, isFollowing} = this.state;

    var contents = null;

    switch (contentsType) {
      case 0:
       contents = this.renderImages(contentsList);
       break;
      case 1:
       contents = this.renderVideo(contentsList[0])
       break;
    }

    const followButton = memberID === loginMemberID ?
                        null : <Ionicons color={isFollowing ? '#EA9389' : '#CCC'} name={isFollowing ? 'md-star' : 'md-star-outline'} size={45} onPress={this._onPressFollowing}/>

    return(
      <View style={styles.container}>

        <View style={styles.info_border}>
          <TouchableWithoutFeedback 
            onPress={this._onPressProfile}>
            <Thumbnail style={{width: 40, height: 40, margin:10}}source={{ uri: utils.makeurls('/' + profileLink) }} scaleX={0.85} scaleY={0.85}/>
          </TouchableWithoutFeedback>
          <Text style={styles.title}>{nickname}</Text>
          {followButton}
        </View>
        <View style={styles.middle}>
          {contents}
        </View>
        <View style={styles.info_border}>
          <Entypo
            style={{ paddingRight: 6 }}
            color={isLike ? '#EA9389' : '#CCC'}
            name={isLike ? 'heart' : 'heart-outlined'}
            size={42}
            onPress={this._onPressLike}/>
          <TouchableWithoutFeedback
            onPress={this._onPressCommentInput}>
            <View style={styles.comment_border}><Text style={styles.comment}>댓글달기</Text></View>
          </TouchableWithoutFeedback>
          <Ionicons
            style={{ paddingLeft: 12 }}
            color="#CCC"
            name="md-expand"
            size={30}
            onPress={this._onPressExpand}/>
        </View>
      </View>
    );
  
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'stretch',
    justifyContent: 'center'
  },
  info_border: {
    height: 50,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingLeft: 9,
    paddingRight: 15
  },
  middle: {
    flex: 1,
    alignItems: 'stretch',
    justifyContent: "center"
  },
  title: {
    flex: 1,
    justifyContent: 'center',
    marginLeft: 10,
    color: '#FFF',
    fontSize: 16
  },
  comment_border: {
    flex: 1,
    justifyContent: 'center',
    borderColor: '#AAA',
    borderWidth: 2,
    borderRadius: 25
  },
  comment: {
    color: '#AAA',
    padding: 5,
    fontSize: 18
  },
});

export default DetailPostScreen;