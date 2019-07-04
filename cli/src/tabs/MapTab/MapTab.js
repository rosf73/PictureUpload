// GET /api/board/post/:member_id 또는 /api/board/me를 통해 얻은 게시물을 출력하는 지도 조회 화면

import React, { Component } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import Icon from 'react-native-vector-icons/AntDesign';

import configs from '../../common/configs';
import { connect } from 'react-redux';
import utils from '../../common/utils';

import MapView from 'react-native-maps'
import { Marker } from 'react-native-maps';

import { Actions } from 'react-native-router-flux'; // New code

import { setPostInfo } from '../../actions/board';

import { NavigationEvents } from "react-navigation";

class MapTab extends Component {
    static navigationOptions = {
        tabBarIcon: ({ tintColor }) => (
            <Icon name="earth" size={24} color={tintColor}/>
        )
    }

    constructor(props) {
      super(props);

      this.state = {
        /*
        region: {
          latitude: 42.882004,
          longitude: 74.582748,
          latitudeDelta: 100,
          longitudeDelta: 100
        },
        */
        region: {
          latitude: 36.45292844321395,
          longitude: 127.51634784042837,
          longitudeDelta: 4.346642419695883,
          latitudeDelta: 4.267832575593111
        },
        tracksViewChanges: true,
      };  
    }

    stopRendering = () =>
    {
        //this.setState({ tracksViewChanges: false });
        setTimeout( () => {this.setState({ tracksViewChanges: false })}, 3000);
    }

    addDeltaToLike = (postID, delta) => {
      let postList = this.props.board.postInfo.postList;

      postList.forEach(function(post, index, theArray) {
        if (post._id === postID)
        {
          theArray[index].numOfLikes += delta;
        }
      });

      this.props.setPostInfo({
          ...this.props.board.postInfo,
          postList
      });
  }

  onWillFocus = (payload) => { // 댓글 삭제 버튼을 위한 로그인 확인 함수
    //console.log("꾸꾸까까까까까");
    this.setState({
      tracksViewChanges: true,
    })
  }

  componentWillReceiveProps(nextProps){
    //console.log("componentWillReceiveProps: " + JSON.stringify(nextProps));

    var curMemberID = this.props.member.memberInfo.id;
    var nextMemberID = nextProps.member.memberInfo.id;

    //console.log('MemberID:');
    //console.log(curMemberID);
    //console.log(nextMemberID);
    if ((utils.isEmpty(curMemberID) && !utils.isEmpty(nextMemberID)) || ((curMemberID != nextMemberID) && !utils.isEmpty(nextMemberID))) {
      this.setState({
        tracksViewChanges: true,
      })
    }
    //if (nextProps.member.)
}

  increaseView = (postID) => {
      let postList = this.props.board.postInfo.postList;

      postList.forEach(function(post, index, theArray) {
        if (post._id === postID)
        {
          theArray[index].numOfViews += 1;
        }
      });

      this.props.setPostInfo({
          ...this.props.board.postInfo,
          postList
      });
  }

    postListToMarkerList = (postList, tag) => {
      const {auth: {token, memberID}} = this.props;

      if (utils.isEmpty(postList))
        return null;
      
      return postList.filter( post => {
          if (utils.isEmpty(tag))
            return true;
          else {
              for (var i = 0; i < post.tagList.length; i++)
                if (post.tagList[i] === tag)
                    return true;
              return false;
          }
      }).map( (post, key) => {
        //console.log(utils.makeurls(post.postMarkerLink));
        
        const { postImageLink, postMarkerLink, postContents, postWriterID, numOfViews, numOfLikes, postDate, _id, contentsList, postTitle, geo } = post;
        
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

        const increaseLike = () => {
          this.addDeltaToLike(_id, 1);
      }

      const decreaseLike = () => {
          this.addDeltaToLike(_id, -1);
      }

        //console.log("뀨뀨뀨뀨");
        //console.log(onPressMarker);

        return <Marker
          key={key}
          coordinate={{"latitude":post.geo[0], "longitude":post.geo[1]}}
          onPress={onPressMarker}
          tracksViewChanges={this.state.tracksViewChanges}
        >
          <View style={styles.markerImgContainer}>
            <Image
              style={styles.markerimage} 
              source={{uri: utils.makeurls('/' + post.postMarkerLink)}}
              onLoad={this.stopRendering}
            />
          </View>
        </Marker>
      });
    }

    onRegionChange = (region) => {
      this.setState({ region });
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
            showsUserLocation={true}>
            {this.postListToMarkerList(this.props.board.postInfo.postList, this.props.board.tag)}
          </MapView>
          </View>
        );
    }
}

const mapStateToProps = state => {
    return {
      board: state.board,
      auth: state.auth,
      member: state.member,
    }
  }
  
const mapDispatchToProps = dispatch => {
  return {
    setPostInfo: (postInfo) => dispatch(setPostInfo(postInfo)),
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
    }
  });

export default connect(mapStateToProps, mapDispatchToProps)(MapTab);