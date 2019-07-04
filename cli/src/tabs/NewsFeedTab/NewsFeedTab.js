// GET /api/board?page={numOfPages} 또는 /api/board?tag={tag명}를 통해 받은 게시물 정보를 출력해주는 화면

import React, { Component } from 'react';
import { StyleSheet, View, Text, Dimensions, FlatList, Alert, ActivityIndicator } from 'react-native';
import { Actions } from 'react-native-router-flux';

import Ionicons from 'react-native-vector-icons/Ionicons';

import axios from 'axios';
import utils from '../../common/utils';

import Post from '../../components/Post';

import Dialog from "react-native-dialog";

import { connect } from 'react-redux';

import { setMemberInfo } from '../../actions/member';
import { setPostInfo } from '../../actions/board';

import { NavigationEvents } from "react-navigation";

class NewsFeedTab extends Component {
    static navigationOptions = {
        tabBarIcon: ({ tintColor }) => (
            <Ionicons name="ios-list" size={30} color={tintColor}/>
        )
        
    }

    constructor(props) {
        super(props);

        this.state = {
            postList: [],
            page:1,
            dialogVisible: false,
            postid: '',
            writerid: '',
            loading: false,
            refreshing: false,
        };
    }

    onScrollEndDrag = () => {
        if (this.state.loading)
            return;

        this.setState({
            page: this.state.page + 1,
            loading: true,
        });
        
        axios.get(utils.makeurls('/api/board?page=' + this.state.page))
        .then( (result) => {
          const postList = result.data.post;
          //var newPostList = this.state.postList.concat(postList);
          //if (newPostList.length > 3)
          //  newPostList = newPostList.slice(newPostList.length - 3);
          
          if (postList.length > 0) {
            this.flatListRef.scrollToOffset({ animated: true, offset: 0 });
            this.setState({
                postList,
                loading: false,
            });
          }
        })
        .catch((err) => {
        });
    }
    
    onWillFocus = (payload) => { // 댓글 삭제 버튼을 위한 로그인 확인 함수
        //console.log("끵끵이??");
        this.props.setMemberInfo({numOfFollowers: 0, numOfPosts:0, nickname:'', profileLink:''}); // 멤버 정보 초기화
        this.props.setPostInfo({}); // 게시물 정보 초기화

        this.setState({
            postList:[],
        });
        
        axios.get(utils.makeurls('/api/board?page=1'))
        .then( (result) => {
          const postList = result.data.post;

          this.setState({
            postList,
            page: 2
          });
        })
        .catch((err) => {
            //console.log(err);
        });
      }

      /*
    componentDidMount() {
        axios.get(utils.makeurls('/api/board?page=' + this.state.page))
        .then( (result) => {
          const postList = result.data.post;

          this.setState({
            postList: this.state.postList.concat(postList),
            page: this.state.page + 1
          });
        })
        .catch((err) => {
        });
    }
    */

    addDeltaToLike = (postID, delta) => {
        var postList = this.state.postList;

        postList.forEach(function(post, index, theArray) {
          if (post._id === postID)
          {
            theArray[index].numOfLikes += delta;
          }
        });

        this.setState({
            postList
        });
    }

    increaseView = (postID) => {
        var postList = this.state.postList;

        postList.forEach(function(post, index, theArray) {
          if (post._id === postID)
          {
            theArray[index].numOfViews += 1;
          }
        });

        this.setState({
            postList
        });
    }

    renderPostList = (postList) => {
        //console.log('In render Cells');
        if (utils.isEmpty(postList))
            return null;

        const curDate = new Date();
        const {auth: {token, memberID}} = this.props;
        
        return postList.map((post, index) => {
            const { postImageLink, postContents, postWriterID, numOfViews, numOfLikes, postDate, _id, contentsList, postTitle } = post;

            const writeDate = new Date(postDate);
            
            const diffhours = utils.diffHours(writeDate.getTime(), curDate.getTime());
            const diffdays = utils.diffDays(writeDate.getTime(), curDate.getTime());
            var prtDate = ''

            if (diffhours < 1)
                prtDate = "새 동영상";
            else if (diffhours < 24)
                prtDate = diffhours + "시간 전";
            else if (diffdays < 7)
                prtDate = diffdays + "일 전";
            else
                prtDate = postDate.substr(0, 10)
            
            const onPressProfile = () => {
                Actions.profile({memberID: postWriterID._id});
            }

            const onPressMore = () => {
                this.setState({
                    dialogVisible: true,
                    postid: _id,
                    writerid: postWriterID._id,
               });
            }

            const increaseLike = () => {
                this.addDeltaToLike(_id, 1);
            }

            const decreaseLike = () => {
                this.addDeltaToLike(_id, -1);
            }

            const onPressPost = () => {
                this.increaseView(_id);

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

            return { 
                key : _id, 
                postImageLink: postImageLink, 
                postWriterID:postWriterID,
                postTitle:postTitle,
                numOfLikes:numOfLikes,
                numOfViews:numOfViews,
                prtDate:prtDate,
                onPressPost:onPressPost,
                onPressProfile:onPressProfile,
                onPressMore:onPressMore
            }
        });
    }

    handleCancel = () => {
        this.setState({ dialogVisible: false });
      };
     
    handleDelete = () => {
        this.setState({ dialogVisible: false });
        
        var postList = this.state.postList;

        const {postid} = this.state;
        const {auth: {token}} = this.props;

        for (idx = 0; idx < postList.length; idx++)
        {
            if (postList[idx]._id === this.state.postid)
                break;
        }
        postList.splice(idx, 1);

        this.setState({
            postList
        });
        
        axios.delete(utils.makeurls('/api/board/post/' + postid + '?token=' + token))
        .then( (result) => {
            //alert('게시물을 삭제하였습니다!');
            })
        .catch((err) => {
            //alert('게시물을 삭제하는데 실패하였습니다!');
        });
    };

    handleRefresh = () => {
        const {page} = this.state;

        if (page <= 2)
            return;

        this.setState({
            page: page - 1,
            refreshing: true
        }, () => {
            //alert(this.state.page);
            var loadPage = this.state.page - 1;
            axios.get(utils.makeurls('/api/board?page=' + loadPage))
            .then( (result) => {
              const postList = result.data.post;
              //var newPostList = this.state.postList.concat(postList);
              //if (newPostList.length > 3)
              //  newPostList = newPostList.slice(newPostList.length - 3);
              
              if (postList.length > 0) {
                this.setState({
                    postList,
                    loading: false,
                    refreshing: false,
                });
              }
            })
            .catch((err) => {
                console.log(err);
            });
        });
    }

    render() {
        const postList = this.renderPostList(this.state.postList)
        const loginMemberID = this.props.auth.memberID;
        const {loading} = this.state.loading;

        return (
            <View style={styles.container}>
                <NavigationEvents
                    onWillFocus={this.onWillFocus}
                />
                <Dialog.Container visible={this.state.dialogVisible}>
                    <Dialog.Title>게시물 삭제</Dialog.Title>
                    <Dialog.Description>
                        게시물을 삭제하시겠습니까?
                    </Dialog.Description>
                    <Dialog.Button label="취소" onPress={this.handleCancel} />
                    <Dialog.Button label="확인" onPress={this.handleDelete} />
                </Dialog.Container>
                <FlatList
                    ref={(ref) => { this.flatListRef = ref; }}
                    data={postList}
                    renderItem={({item}) =>
                    <Post
                        key={item.key}
                        postImageLink={item.postImageLink}
                        postWriterID={item.postWriterID}
                        postTitle={item.postTitle}
                        numOfLikes={item.numOfLikes}
                        numOfViews={item.numOfViews}
                        prtDate={item.prtDate}
                        onPressPost={item.onPressPost}
                        onPressProfile={item.onPressProfile}
                        onPressMore={item.onPressMore}
                        isMine={item.postWriterID._id == loginMemberID}
                    />
                    }
                    onEndReached={this.onScrollEndDrag}
                    onEndReachedThreshold={0.1}
                    refreshing={this.state.refreshing}
                    onRefresh={this.handleRefresh}
                />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF'
    },
})

const mapStateToProps = state => {
    return {
      auth: state.auth,
    }
  }

const mapDispatchToProps = dispatch => {
    return {
        setMemberInfo: (memberInfo) => dispatch(setMemberInfo(memberInfo)),
        setPostInfo: (postInfo) => dispatch(setPostInfo(postInfo)),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(NewsFeedTab);