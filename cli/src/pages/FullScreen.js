import React, { Component } from 'react';

import Slideshow from 'react-native-image-slider-show';
import TimedSlideshow from 'react-native-timed-slideshow';

import {AsyncStorage, Dimensions } from 'react-native';
import Video from 'react-native-video'

import utils from '../common/utils';

import {
  StyleSheet,
  View,
  BackHandler,
  StatusBar
} from 'react-native';

import { Thumbnail } from 'native-base';

import Icon from 'react-native-vector-icons/Ionicons';
import Entypo from 'react-native-vector-icons/Entypo';

import { Actions } from 'react-native-router-flux'; // New code
//import Navbar from '../components/Navbar';

import axios from 'axios';

import { setMemberInfo } from '../actions/member';
import { connect } from 'react-redux';

export default class FullScreen extends Component<Props> {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    //alert('Token:' + this.props.auth.token);
    StatusBar.setHidden(true);
    BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);
  }

  componentWillUnmount() {
    StatusBar.setHidden(false);
    BackHandler.removeEventListener('hardwareBackPress', this.handleBackPress);
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
        muted={false}
        repeat={true}
        resizeMode={"cover"}
        volume={1.0}
        rate={1.0}
        fullscreen={true}
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
    //alert('hi');
    //console.log(Actions.currentScene);
    if (Actions.currentScene === 'fullscreen') {
      Actions.pop();
      return true;
    }
    return false;
    //Actions.pop()
  }

  onBuffer = () => {
    //console.log('onBuffer');
  }

  onEnd = () => {
    //console.log('onEnd');
  }

  render() {
    //console.log(this.props);
    //console.log(this.getImageURLs(this.props.contentsList));
    const {contentsType, contentsList} = this.props;

    let contents = null;

    switch (contentsType) {
      case 0:
       contents = this.renderImages(contentsList);
       break;
      case 1:
       contents = this.renderVideo(contentsList[0]);
       break;
    }

   return(
    <View style={styles.container}>
        {contents}
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
});