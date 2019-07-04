// GET /api/board?page={numOfPages} 또는 /api/board?tag={tag명}를 통해 받은 게시물 정보를 출력해주는 화면

import React, { Component } from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity, TouchableNativeFeedback, Dimensions } from 'react-native';

import Ionicons from 'react-native-vector-icons/Ionicons';
import Entypo from 'react-native-vector-icons/Entypo'

import { Thumbnail } from 'native-base';

import utils from '../common/utils';

import { Actions } from 'react-native-router-flux';

const width = Dimensions.get("window").width;

const Post = props => {
  const {
    postImageLink,
    postWriterID,
    postTitle,
    numOfLikes,
    numOfViews,
    prtDate,
    onPressPost,
    onPressProfile,
    onPressMore,
    isMine,
  } = props;

  return (
    <TouchableOpacity
        onPress={onPressPost}
        activeOpacity={0.8}>
        <Image style={styles.thumbnail} source={{ uri: utils.makeurls('/' + postImageLink) }}/>
        <View style={styles.info}>

            <TouchableOpacity 
                onPress={onPressProfile}
                activeOpacity={0.5}>
                <View style={{ marginRight: 7, marginBottom: 20 }}>
                    <Thumbnail source={{ uri: utils.makeurls('/' + postWriterID.profileLink) }} scaleX={0.85} scaleY={0.85}/>
                </View>
            </TouchableOpacity>

            <View style={{ width: '75%' }}>
                <Text style={styles.text_title}>{postTitle}</Text>
                <View style={{ flexDirection: 'row' }}>
                    <Text style={styles.text_info}>{postWriterID.nickname} · </Text>
                    <Ionicons color="#F8E0E6" name="md-heart" size={20}/>
                    <Text style={styles.text_info}> {numOfLikes} · 조회수 {numOfViews}회</Text>
                </View>
                <Text style={styles.text_info}>{prtDate}</Text>
            </View>
            {isMine ? 
            <TouchableNativeFeedback 
                onPress={onPressMore}
                background={TouchableNativeFeedback.Ripple("", true)}>
                <View style={{ paddingLeft: 7, paddingRight: 10, justifyContent: 'center', marginBottom: 35 }}>
                    <Ionicons color="#888" name="md-more" size={25}/>
                </View>
            </TouchableNativeFeedback>
             : null
            }
        </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF'
    },
    thumbnail: {
        height: width*(9/16),
        backgroundColor: 'black'
    },
    info: {
        marginTop: 10,
        marginLeft: 20,
        marginBottom: 15,
        paddingBottom: 30,
        flexDirection: 'row'
    },
    text_title: {
        fontSize: 15,
        color: '#353535'
    },
    text_info: {
        fontSize: 13,
        color: '#A2A2A2'
    }
})
  
export default Post;