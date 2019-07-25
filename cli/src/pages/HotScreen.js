// 인기 게시물 조회 스크린
import React, { Component } from 'react';
import MapView from 'react-native-maps'
import { Marker } from 'react-native-maps';

import axios from 'axios';
import configs from '../common/configs';
import { connect } from 'react-redux';
import utils from '../common/utils';

import {AsyncStorage} from 'react-native';

import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Button,
  Image,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';

import { Actions } from 'react-native-router-flux'; // New code

import { setToken, setAuth, setMemberID } from '../actions/auth';
import { setMemberInfo } from '../actions/member';
import { setPostInfo } from '../actions/board';

import Icon from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

import { NavigationEvents } from "react-navigation";

class HotScreen extends Component<Props> {
  static navigationOptions = {
    tabBarIcon: ({ tintColor }) => (
        <Icon name="ios-flame" size={30} color={tintColor}/>
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
      selectTag: '',
      showing: false,
      tracksViewChanges: true,
      count: 0,
    };

   this.retrieveData();
  }

  stopRendering = () =>{
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

  componentDidMount() {
    axios.get(utils.makeurls('/api/board/hot'))
    .then((result) => {
      this.setState({postList: result.data});
    })
    .catch((err) => {
    });
  }

  onWillFocus = (payload) => { // 댓글 삭제 버튼을 위한 로그인 확인 함수
    const {setMemberInfo, setMemberID, setAuth, auth: {token}} = this.props;

    setMemberInfo({numOfFollowers: 0, numOfPosts:0, nickname:'', profileLink:''});
    setPostInfo({}); // 게시물 정보 초기화

    if (!utils.isEmpty(token)) {
      axios.get(utils.makeurls('/api/member/me?token=' + token))
      .then((result) => {
        const { memberProfile, numOfFollowers, numOfPosts, isFollowed, me } = result.data;
        
        this.props.setMemberID(memberProfile._id);
      })
      .catch((err) => {
        utils.storeToken(''); // 토큰 정보가 옳바르지 않을 경우 토큰을 삭제함
      });
    }
  }

  postListToMarkerList = (hotPost) => {
    var postList = [];
    const {auth: {token, memberID}} = this.props;
    const {selectTag} = this.state;

    if (selectTag === '')
    {
      for (var tag in hotPost) {
        postList = postList.concat(hotPost[tag]);
      }
    }
    else
    {
      postList = hotPost[selectTag];
    }

    if (postList.length <= 0)
      return null;

    var goodPostList = [];
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

  initSelectTag = () => {
    this.setState({
      selectTag: '',
      tracksViewChanges: true,
    });
  }

  renderTagList = () => {
    const tagList = [{tag:'음악', icon:'music', type:1}, {tag:'여행', icon:'earth', type:1}, {tag:'음식', icon:'food', type:1}, {tag:'쇼핑', icon:'shopping', type:1}, 
                   {tag: '동물', icon:'dog', type:2}, {tag:'힐링', icon:'leaf', type:1}, {tag:'일상', icon:'coffee', type:1}];
   
    const {selectTag} = this.state;

    return tagList.map((tagInfo, index) => {
        const { icon, tag, type } = tagInfo;

        const onPress = () => {
          this.setState({selectTag: tag, tracksViewChanges: true})
        }
      
      const color = tag === selectTag ? '#000' : '#d1cece';
      const text_style = tag === selectTag ? styles.text_title : styles.text_title_inactive;
      var iconComponent = null;
      switch(type) {
        case 1:
          iconComponent = <MaterialCommunityIcon size={40} name={icon} color={color}/>
          break;
        case 2:
          iconComponent = <FontAwesome5 size={40} name={icon} color={color}/>
          break;
      }

      return (
        <TouchableOpacity
          key={index}
          onPress={onPress}
          activeOpacity={0.8}>
          <View style={styles.info}>
            {iconComponent}
            <Text style={text_style}>{tag}</Text>
          </View>
        </TouchableOpacity>
      );
    });
  }

  onRegionChange = (region) => {
    //console.log(region);
    this.setState({ region });
  }

  render() {
    const tagList = this.renderTagList()
    const { width } = Dimensions.get('window')
    const text_style = this.state.selectTag === '' ? styles.text_title : styles.text_title_inactive;

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
            <TouchableOpacity
                onPress={this.initSelectTag}
                activeOpacity={0.8}>
                <View style={styles.info}>
                  <Image style={styles.markerimage} source={require('../../resources/imgs/Picup.png')}/>
                  <Text style={text_style}>{'전체'}</Text>
                </View>
            </TouchableOpacity>
                {tagList}
        </ScrollView>
        </View>
        <MapView
          style={{flex: 10}}
          region={this.state.region}
          onRegionChangeComplete={this.onRegionChange}
          zoom={0}
          showsUserLocation={this.state.showing}
        >
            {this.postListToMarkerList(this.state.postList)}
        </MapView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
    color: '#ffffff',
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
  info: {
    margin: 10,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems:'center',
  },
  text_title: {
    fontSize: 16,
    color: '#000'
  },
  text_title_inactive: {
    fontSize: 15,
    color: '#d1cece'
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
    setAuth: (isAuth) => dispatch(setAuth(isAuth)),
    setMemberID: (memberID) => dispatch(setMemberID(memberID)),
    setMemberInfo: (memberInfo) => dispatch(setMemberInfo(memberInfo)),
    setPostInfo: (postInfo) => dispatch(setPostInfo(postInfo)),
  }
}

//export default HomeScreen;
export default connect(mapStateToProps, mapDispatchToProps)(HotScreen);