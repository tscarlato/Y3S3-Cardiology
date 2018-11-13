import React, { Component }  from 'react';
import { StyleSheet, Image, TouchableHighlight, Dimensions } from 'react-native';

export default class PauseButton extends Component {
    render()
    {
        return (
        <TouchableHighlight onPress={this.props.onClick}  >
            <Image style={styles.captureButton} accessible={true} accessibilityLabel="Pause Camera"/>
        </TouchableHighlight>
        );
    }
}

const styles = StyleSheet.create({
    captureButton: {
      flex: 1,
      justifyContent: 'flex-end',
      alignItems: 'center',
      height: '50%',
      width: Dimensions.get('window').width,
      backgroundColor: 'rgba(211,48,48,0)'
    }
});