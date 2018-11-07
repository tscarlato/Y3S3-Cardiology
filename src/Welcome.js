//take a tour
//instructions to use
import React, { Component } from 'react';
import { StyleSheet, Text, View, Dimensions, } from 'react-native';


export default class Welcome extends Component {
    render()
    {
        return (
            <View style={styles.welcomePage}>
                <Text>Welcome to Card Whisperer</Text>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    welcomPage: {
      flex: 1,
      justifyContent: 'flex-end',
      alignItems: 'center',
      height: '100%',
      width: Dimensions.get('window').width,
      backgroundColor: 'rgba(255,0,0,0)'
    }
});