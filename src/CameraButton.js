import React, { Component }  from 'react';
import { StyleSheet, Image, TouchableHighlight, Dimensions, View } from 'react-native';

var { height } = Dimensions.get('window');
var box_count = 2;
var box_height = height / box_count;
export default class CameraButton extends Component {
    render()
    {
        return (
            <View style={{flex: 1, flexDirection: 'column'}}>
                <TouchableHighlight onPress={this.props.onClick}  >
                    <Image style={[styles.box, styles.captureButton]} accessible={true} accessibilityLabel="Take picture"/>
                </TouchableHighlight>
                <TouchableHighlight onPress={this.props.onClick}  >
                    <Image style={[styles.box, styles.pauseButton]} accessible={true} accessibilityLabel="Pause Camera"/>
                </TouchableHighlight>
            </View>
            
        );
    }
}

const styles = StyleSheet.create({
  
    captureButton: {
        
      //alignItems: 'center',
      height: box_height,
      
      width: Dimensions.get('window').width,
      backgroundColor: '#fff4be', 
      //'rgba(0,0,0,0)'
    },
    pauseButton: {
    
        height: box_height,
        //alignItems: 'center',
        
       
        width: Dimensions.get('window').width,
        backgroundColor: '#4242f4', 
        //'rgba(0,0,0,0)'
      }
});
