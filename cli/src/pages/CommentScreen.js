import React, { Component } from 'react';
import { StyleSheet, View, Text, TextInput, ScrollView, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import Comment from '../components/Comment.js'

import axios from 'axios';
import utils from '../common/utils';

import { Actions } from 'react-native-router-flux'; // New code

import Dialog from "react-native-dialog";

import { connect } from 'react-redux';

class CommentScreen extends Component {
    constructor(props) {
        super(props);

        this.state = {
            commentList: [],
            numOfLikes: 0,
            myComment: '',
            isLikedPost: false,
            update:false,
            dialogVisible: false,
            comment_id: '',
        };
    }

    componentDidMount() {
        axios.get(utils.makeurls('/api/board/post/comment/' + this.props.postID + '?token=' + this.props.token))
        .then((result) => {
          const commentList = result.data.commentList;

          this.setState({
            commentList: commentList,
          });
        })
        .catch((err) => {
        });
    }

    _onPressComplete = () => {
        Actions.pop();
    }

    _updateScroll = () => {
        this.myScroll.scrollToEnd({animated: true})
    }

    _onPressSend = () => {
        //alert(this.state.myComment);
        let {myComment} = this.state;
        if (myComment.length <= 0)
            return;

        if (myComment.length > 45) {
            Alert.alert('알람', '댓글은 45자 이내로 작성해주세요!',   [
                {text: '확인', onPress: () => {}},
              ],);
            return;
        }

        axios.post(utils.makeurls('/api/board/post/comment/' + this.props.postID + '?token=' + this.props.token), {commentContents: this.state.myComment})
        .then(res => {
            let newCommentList = this.state.commentList;
            newCommentList.push(res.data.comment);

            this.setState({
                commentList: newCommentList,
                myComment:'',
                update:true,
            });

            setTimeout(() => {this._updateScroll()}, 500)
        })
        .catch((err) => {
            Alert.alert('알람', '댓글 작성에 실패하였습니다!',   [
                {text: '확인', onPress: () => {}},
              ],);
        });
    }

    renderComment = (commentList) => {
        return commentList.map((comment, index) => {
            const { commentContents, commentWriterID : {nickname, profileLink }, commentDate, _id } = comment;
            const writer_id = comment.commentWriterID._id;

            var newCommentDate = commentDate.substring(0, 10) + ' ' + commentDate.substring(11, 19);

            const onPressDelete = () => {
                this.setState({
                     dialogVisible: true,
                     comment_id: _id,
                });
             }

            return (
                <Comment
                    key={index}
                    userPhoto={profileLink}
                    userName={nickname}
                    userComment={commentContents}
                    likeComment={0}
                    onPressDelete={onPressDelete}
                    timeWithComment={newCommentDate}
                    canDelete={writer_id === this.props.auth.memberID}    
                />
            );
        });
    }

    handleCancel = () => {
        this.setState({ dialogVisible: false });
    };
     
    handleDelete = () => {
        
        var {commentList, comment_id} = this.state;
        const {postID, token} = this.props;

        axios.delete(utils.makeurls('/api/board/post/comment/' + postID + '/' + comment_id + '?token=' + token))
        .then(res => {
        })
        .catch((err) => {
        });
        
        const idx = commentList.findIndex(item => item._id === comment_id);

        commentList.splice(idx, 1);
        this.setState({
            commentList,
            dialogVisible: false,
            comment_id: ''
        });
    };

    render() {
        const { commentList } = this.state;
        const { numOfLikes } = this.props;

        let commentCells = this.renderComment(commentList);

        return (
            <View style={styles.container}>
                <Dialog.Container visible={this.state.dialogVisible}>
                    <Dialog.Title>댓글 삭제</Dialog.Title>
                    <Dialog.Description>
                        댓글을 삭제하시겠습니까?
                    </Dialog.Description>
                    <Dialog.Button label="취소" onPress={this.handleCancel} />
                    <Dialog.Button label="확인" onPress={this.handleDelete} />
                </Dialog.Container>
                <View style={styles.bubble}>
                    <View style={styles.header}>
                        <Text style={{ textAlign: 'center', color: '#FFF', fontSize: 17 }}>완료</Text>
                        <Text style={styles.title}>댓글</Text>
                        <Text style={{ textAlign: 'center', fontSize: 17 }} onPress={this._onPressComplete}>완료</Text>
                    </View>
                    <View style={styles.likes}>
                        <Icon
                            color={'#EA9389' }
                            name={'md-heart'}
                            size={26}
                            onPress={this._onPressLikePost}/>
                        <Text style={{ fontWeight: 'bold' }}>  {numOfLikes}</Text>
                    </View>
                    <View style={styles.comments}>
                        <ScrollView
                            ref={(ref) => {
                                this.myScroll = ref
                            }}
                        >
                            {commentCells}
                        </ScrollView>
                    </View>
                    <View style={styles.footer}>
                        <View style={styles.footer_comment}>
                            <TextInput
                                style={styles.comment_input}
                                autoFocus={true}
                                placeholder="@태그 댓글입력"
                                placeholderTextColor="#9F9F9F"
                                value={this.state.myComment}
                                onChangeText={(text) => this.setState({myComment: text})}
                                maxLength={45}
                            />
                            <Icon style={styles.comment_send} color="#008AFF" name="md-send" size={35} onPress={this._onPressSend}/>
                        </View>
                        <View style={styles.triangle}></View>
                    </View>
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000'
    },
    bubble: {
        flex: 1,
        alignItems: 'stretch',
        justifyContent: 'center',
        margin: 5
    },
    header: {
        height: 50,
        backgroundColor: '#FFF',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingLeft: 13,
        paddingRight: 13,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#CCC'
    },
    likes: {
        height: 35,
        backgroundColor: '#FFF',
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: 13,
        borderBottomWidth: 1,
        borderBottomColor: '#CCC'
    },
    comments: {
        flex: 1,
        alignItems: 'stretch',
        backgroundColor: '#FFF'
    },
    footer: {
        height: 72,
        borderTopWidth: 1,
        borderTopColor: '#CCC',
        alignItems: 'stretch'
    },
    title: {
        flex: 1,
        textAlign: 'center',
        fontWeight: 'bold',
        color: '#333',
        fontSize: 20
    },
    footer_comment: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingLeft: 10,
        paddingRight: 10,
        backgroundColor: '#FFF',
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10
    },
    comment_input: {
        flex: 1,
        justifyContent: 'center',
        fontSize: 18,
        backgroundColor: '#EFEFEF',
        marginTop: 7,
        marginBottom: 7,
        borderRadius: 25,
        paddingLeft: 15
    },
    comment_send: {
        justifyContent: 'flex-end',
        paddingLeft: 10
    },
    triangle: {
        alignSelf: 'center',
        width: 0,
        height: 0,
        borderStyle: 'solid',
        borderLeftWidth: 20,
        borderRightWidth: 20,
        borderBottomWidth: 15,
        borderBottomColor: '#FFF',
        transform: [{ rotate: '180deg' }]
    }
})

const mapStateToProps = state => {
    return {
      auth: state.auth
    }
  }
  

  
//export default HomeScreen;
export default connect(mapStateToProps)(CommentScreen);