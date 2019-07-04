// 구독자 게시물 조회 스크린
import React, { Component } from 'react';
import MapView from 'react-native-maps';
import { Marker } from 'react-native-maps';

import axios from 'axios';

import { connect } from 'react-redux';
import utils from '../common/utils';

import {AsyncStorage} from 'react-native';

import { NavigationEvents } from "react-navigation";

import {
  StyleSheet,
  Text,
  View,
  Image,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';

import { Actions } from 'react-native-router-flux'; // New code

import { setToken, setAuth } from '../actions/auth';
import { setFollowingMemberList, setFollowingPostList } from '../actions/following';
import { setMemberInfo } from '../actions/member';
import { setPostInfo } from '../actions/board';

import Icon from 'react-native-vector-icons/Ionicons';

class FollowingsScreen extends Component<Props> {

  static navigationOptions = {
    tabBarIcon: ({ tintColor }) => (
        <Icon name="logo-youtube" size={25} color={tintColor}/>
    )
}
  
  constructor(props) {
    super(props);

    this.state = {
      region: {
        latitude: 36.45292844321395,
        longitude: 127.51634784042837,
        longitudeDelta: 4.346642419695883,
        latitudeDelta: 4.267832575593111
      },

      postList: [],
      followings: [],
      load: false,
      tracksViewChanges: true,
    };
  }

  stopRendering = () =>
  {
      setTimeout( () => {this.setState({ tracksViewChanges: false })}, 3000);
  }

  onWillFocus = (payload) => {
    const {setMemberInfo, setPostInfo, setAuth, setFollowingMemberList, setFollowingPostList, auth: {token}} = this.props;

    setMemberInfo({numOfFollowers: 0, numOfPosts:0, nickname:'', profileLink:''});
    setPostInfo({});

    if (!utils.isEmpty(token)) {
      /* HotScreen에서 이미 토큰을 체크 했으므로
      axios.get(utils.makeurls('/api/member/me?token=' + token))
      .then((result) => {
        const { memberProfile, numOfFollowers, numOfPosts, isFollowed, me } = result.data;
      })
      .catch((err) => {
        //console.log(err);
        Actions.reset('login');
      });
      */

      axios.get(utils.makeurls('/api/board/me/followingspost?token=' + token))
      .then((result) => {
        this.setState(
          {
            load: true,
          }
        );

        setFollowingMemberList(result.data.myfollow);
        setFollowingPostList(result.data.post);
      })
      .catch((err) => {
      });
    }
    else {
      Actions.reset('login');
    }
  }

 postListToMarkerList = (postList) => {
  const { auth: {token, memberID}} = this.props;
  
  let goodPostList = [];
  for (var i = 0; i < postList.length; i++)
  {
    if (!utils.isEmpty(postList[i].geo) && !utils.isEmpty(postList[i].postMarkerLink))
    {
        goodPostList.push(postList[i]);
    }
  }

  return goodPostList.map( (post, key) => {
    const { postImageLink, postMarkerLink, postContents, postWriterID, numOfViews, numOfLikes, postDate, _id, contentsList, postTitle, geo } = post;

    const increaseLike = () => {
    }

    const decreaseLike = () => {
    }

    const onPressMarker = () => {
      Actions.detailpost(
        {
          postID: _id, 
          contentsList: contentsList, 
          contentsType: contentsList[0].contentsType, 
          memberID: postWriterID, 
          token, 
          title:postTitle, 
          text:postContents,
          increaseLike:increaseLike,
          decreaseLike:decreaseLike,
          numOfLikes: numOfLikes,
          loginMemberID: memberID,
        });
    }

    return (<Marker
        key={key}
        coordinate={{"latitude":geo[0], "longitude":geo[1]}}
        onPress={onPressMarker}
        zIndex={key}
        tracksViewChanges={this.state.tracksViewChanges}
      >
        <View style={{width:42,height:42,borderWidth:0,alignItems:'center',justifyContent:'center',backgroundColor:'#FFA7A7', borderRadius:20}}>
          <Image
            style={styles.markerimage} 
            source={{uri: utils.makeurls('/' + postMarkerLink)}}
            onLoad={this.stopRendering}
          />
        </View>
      </Marker>
      )
    });
  }

  renderFollowings = (followingList) => {
    return followingList.map((following, index) => {
        const { profileLink, _id, nickname } = following.followingMemberID;

        const onPressProfile = () => {
          Actions.profile({memberID: _id});
        }

        return (
            <TouchableOpacity
                key={index}
                onPress={onPressProfile}
                activeOpacity={0.8}>
                <View style={styles.info}>
                  <Image style={styles.markerimage} source={{ uri: utils.makeurls('/' + profileLink) }}/>
                  <Text style={styles.text_title}>{nickname}</Text>
                </View>
            </TouchableOpacity>
        )
    })
  }

  onRegionChange = (region) => {
    this.setState({ region });
  }

  render() {
    const { width } = Dimensions.get('window')
    const { follow : {memberList, postList }} = this.props;

    if (!this.state.load) {
      return (
        <View style={styles.container}>
        <NavigationEvents
              onWillFocus={this.onWillFocus}
        />
        </View>
      );
    }
    else if (memberList.length <= 0) {
      return (
        <View style={styles.container_empty}>
          <NavigationEvents
              onWillFocus={this.onWillFocus}
          />
          <View style={styles.container_text_empty}>
              <Text style={styles.text_empty}>{'구독자를 추가해주세요!'}</Text>
          </View>
        </View>
      )
    }
    else {
      return (
        <View style={styles.container}>
          <NavigationEvents
              onWillFocus={this.onWillFocus}
          />
          <View style={{height: 80, marginTop:10, width: width, backgroundColor:'#ffffff'}}>
          <ScrollView
                  horizontal={true}
                  showsHorizontalScrollIndicator={true}
              >
                  {this.renderFollowings(memberList)}
          </ScrollView>
          </View>
          <MapView
            style={{flex: 10}}
            region={this.state.region}
            onRegionChangeComplete={this.onRegionChange}
            zoom={0}
            showsUserLocation={false}>
              {this.postListToMarkerList(postList)}
          </MapView>
        </View>
      );
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  container_empty: {
    flex: 1,
    backgroundColor: '#FFF',
    alignItems:'center',
  },
  container_text_empty: {
      flex: 1,
      backgroundColor: '#FFF',
      alignItems:'center',
      justifyContent:'center',
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
  },
  info: {
    margin: 10,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems:'center',
  },
  text_title: {
    fontSize: 15,
    color: '#353535'
  },
  text_empty: {
    fontSize: 15,
    color: '#353535'
  },
});

const mapStateToProps = state => {
  return {
    auth: state.auth,
    follow: state.follow,
  }
}

const mapDispatchToProps = dispatch => {
  return {
    setToken: (token) => dispatch(setToken(token)),
    setAuth: (isAuth) => dispatch(setAuth(isAuth)),
    setFollowingMemberList: (memberList) => dispatch(setFollowingMemberList(memberList)),
    setFollowingPostList: (postList) => dispatch(setFollowingPostList(postList)),
    setMemberInfo: (memberInfo) => dispatch(setMemberInfo(memberInfo)),
    setPostInfo: (postInfo) => dispatch(setPostInfo(postInfo)),
  }
}

//export default HomeScreen;
export default connect(mapStateToProps, mapDispatchToProps)(FollowingsScreen);