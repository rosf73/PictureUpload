// GET /api/board?page={numOfPages} 또는 /api/board?tag={tag명}를 통해 받은 태그 정보를 출력해주는 화면

import React, { Component } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';

import { connect } from 'react-redux';
import utils from '../../common/utils';

import { setTag } from '../../actions/board';

class TagListTab extends Component {
    static navigationOptions = {
        tabBarIcon: ({ tintColor }) => (
            <Icon name="hashtag" size={25} color={tintColor}/>
        )
    }

    renderTag (tagSet) {
        //console.log('In render Cells');
        if (utils.isEmpty(tagSet))
            return null;

        let tagList = [];
        for (var key in tagSet) {
            tagList.push({tag:key, link:tagSet[key]})
        }

        return tagList.map((cell, index) => {
            const { tag, link } = cell;

            const onPressTag = () => {
                this.props.setTag(tag);
                this.props.navigation.navigate('MapTab');
            }
    
            return (
                <TouchableOpacity
                    key={index}
                    onPress={onPressTag}
                    activeOpacity={0.8}>
                    
                    <View style={styles.info}>
                        <Image style={styles.tagimage} source={{ uri: utils.makeurls('/' + link) }}/>
                        <Text style={styles.text_title}>{tag}</Text>
                    </View>
                </TouchableOpacity>
            )
        })
    }

    render() {
        return (
            <View style={styles.container}>
                {this.renderTag(this.props.board.postInfo.tagSet)}
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row', 
        flexWrap: 'wrap',
        margin:40,
    },
    info: {
        margin: 10,
        marginLeft: 18,
        marginBottom: 30,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-around',
    },
    tagimage: {
        height: 80,
        width: 80,
        borderRadius: 100,
      }
});

const mapStateToProps = state => {
    return {
      board: state.board
    }
  }
  
const mapDispatchToProps = dispatch => {
  return {
    setTag: (tag) => dispatch(setTag(tag)),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(TagListTab);