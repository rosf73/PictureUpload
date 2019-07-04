// 추천 게시물 조회 스크린
import React, { Component } from 'react';
import MapView from 'react-native-maps'
import { Marker } from 'react-native-maps';

import axios from 'axios';
import { connect } from 'react-redux';
import utils from '../common/utils';

import {
  StyleSheet,
  View,
  Image,
} from 'react-native';

import { Actions } from 'react-native-router-flux'; // New code

import { setToken } from '../actions/auth';
import { setMemberInfo } from '../actions/member';
import { setPostInfo } from '../actions/board';

import Icon from 'react-native-vector-icons/Ionicons';

import { NavigationEvents } from "react-navigation";

class RecommendScreen extends Component<Props> {

  static navigationOptions = {
    tabBarIcon: ({ tintColor }) => (
      <Icon name="md-thumbs-up" size={30} color={tintColor}/>
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
      showing: false,
      postList: [],
      tracksViewChanges: true,
    };

   this.retrieveData();
  }

  stopRendering = () =>
  {
      //this.setState({ tracksViewChanges: false });
      //if (!this.state.tracksViewChanges)
        setTimeout( () => {this.setState({ tracksViewChanges: false })}, 3000);
  }

  retrieveData = async () => {
    try {
      const value = await AsyncStorage.getItem('Token');
      if (value !== null) { // 토큰이 존재할 경우 토큰을 props에 등록
        this.props.setToken(value);
        return value;
      }
    } catch (error) {
      return null;
    }
  };

  onWillFocus = (payload) => {
    this.props.setMemberInfo({numOfFollowers: 0, numOfPosts:0, nickname:'', profileLink:''});
    this.props.setPostInfo({}); // 게시물 정보 초기화

    if (!utils.isEmpty(this.props.auth.token)) {
      /*
      axios.get(utils.makeurls('/api/member/me?token=' + this.props.auth.token))
      .then((result) => {
        const { memberProfile, numOfFollowers, numOfPosts, isFollowed, me } = result.data;
        
        this.props.setAuth(true);
      })
      .catch((err) => {
        Actions.reset('login');
      });
      */
    }
    else {
      Actions.reset('login');
    }
  }

  componentDidMount() {
   axios.get(utils.makeurls('/api/board/recommendedPostHardNew?token=' + this.props.auth.token))
   .then((result) => {
     //console.log('in /board/hot');
     //console.log(result);
     //console.log(result.data);
     this.setState({postList: result.data.newRecommendPost});
   })
   .catch((err) => {
     //console.log(err);
   });
  }

onRegionChange = (region) => {
  this.setState({ region });
}

postListToMarkerList = (postList) => {
  const {auth: {token, memberID}} = this.props;

  return postList.map( (post, key) => {
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
          memberID: postWriterID._id, 
          token, 
          title:postTitle, 
          text:postContents,
          increaseLike:increaseLike,
          decreaseLike:decreaseLike,
          numOfLikes: numOfLikes,
          loginMemberID: memberID,
        });
    }

    return <Marker
      key={key}
      coordinate={{"latitude":geo[0], "longitude":geo[1]}}
      onPress={onPressMarker}
      zIndex={key}
      tracksViewChanges={this.state.tracksViewChanges}
    >
      <View style={styles.markerImgContainer}>
        <Image
          style={styles.markerimage} 
          source={{uri: utils.makeurls('/' + postMarkerLink)}}
          onLoad={this.stopRendering}
        />
      </View>
    </Marker>
  });
}

  render() {
    return (
      <View style={styles.container}>
        <NavigationEvents
            onWillFocus={this.onWillFocus}
        />
        <MapView
          style={{flex: 10}}
          region={this.state.region}
          onRegionChangeComplete={this.onRegionChange}
          zoom={0}
          showsUserLocation={this.state.showing}>
            {this.postListToMarkerList(this.state.postList)}
        </MapView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  markerImgContainer: {
    width:42,
    height:42,
    borderWidth:0,
    alignItems:'center',
    justifyContent:'center',
    backgroundColor:'#FFA7A7', 
    borderRadius:20
  },
  markerimage: {
    height: 40,
    width: 40,
    borderRadius: 20,
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
    setMemberInfo: (memberInfo) => dispatch(setMemberInfo(memberInfo)),
    setPostInfo: (postInfo) => dispatch(setPostInfo(postInfo)),
  }
}

//export default HomeScreen;
export default connect(mapStateToProps, mapDispatchToProps)(RecommendScreen);