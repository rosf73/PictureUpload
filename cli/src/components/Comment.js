import React, { Component } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Thumbnail } from 'native-base';
import PropTypes from "prop-types";

import utils from '../common/utils';

export default class Comment extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isLikedComment: false
        };
    }

    static propTypes = {
        userPhoto: PropTypes.string.isRequired,
        userName: PropTypes.string.isRequired,
        userComment: PropTypes.string.isRequired,
        likeComment: PropTypes.number.isRequired,
        timeWithComment: PropTypes.string.isRequired
    };
    
    render() {
        const { isLikedComment } = this.state;
        const deleteText = this.props.canDelete ? <Text style={{ fontSize: 13, color: '#BBB' }} onPress={this.props.onPressDelete}>삭제</Text> : null;

        return (
            <View style={styles.container}>
                <Thumbnail source={{ uri: utils.makeurls('/' + this.props.userPhoto) }} scaleX={0.75} scaleY={0.75}/>
                <View style={{ flex: 1, marginLeft: 10, marginRight: 20 }}>
                    <View style={styles.comment}>
                        <Text style={styles.user_name}>{this.props.userName}</Text>
                        <Text style={styles.user_comment}>{this.props.userComment}</Text>
                    </View>
                    <View style={styles.info}>
                        <Text style={{ fontSize: 13, color: '#BBB', marginRight: 20 }}>{this.props.timeWithComment}</Text>
                        {deleteText}
                    </View>
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'stretch',
        flexDirection: 'row',
        margin: 7,
        marginTop: 17
    },
    comment: {
        backgroundColor: '#EFEFEF',
        borderRadius: 20,
        padding: 10
    },
    user_name: {
        fontWeight: 'bold',
        fontSize: 17,
        color: '#000',
        marginBottom: 3
    },
    user_comment: {
        fontSize: 15,
        color: '#222'
    },
    info: {
        flexDirection: 'row',
        padding: 3,
        paddingLeft: 10
    },
    like: {
        alignItems: 'center',
        paddingTop: 5,
        paddingRight: 5
    }
})