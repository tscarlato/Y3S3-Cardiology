import React, { Component } from 'react';
import { StyleSheet, Alert, Modal, TouchableOpacity, Text, View, Dimensions, } from 'react-native';
import { RNCamera } from 'react-native-camera';
import CameraButton from './CameraButton';
import axios from 'axios';
import Tts from 'react-native-tts';
import KeepAwake from 'react-native-keep-awake';
import  { YellowBox } from 'react-native';
import PauseButton from './PauseButton';

YellowBox.ignoreWarnings(['Sending...']);

export default class App extends Component {
  constructor(props) {
    super(props)

    this.state = {
      loading: false,
      bearerToken: [],
      identifiedAs: '',
      initialTokenTime: null,
      mlresults: {
        payload: ["waiting for picture"]
      },
      ADN: [],
      cameraType : 'front',
      mirrorMode : false,
      shouldBeAwake: true,
      cameraPause: true,
    }
    this.getJWTToken = this.getJWTToken.bind(this);
    this.takePicture = this.takePicture.bind(this);
    this.speakResults = this.speakResults.bind(this);
    this.pauseCamera = this.pauseCamera.bind(this);
  }  
 
  changeKeepAwake(shouldBeAwake) {    
    if (shouldBeAwake) {
      KeepAwake.activate();
    } else {
      KeepAwake.deactivate();
    }
  }

  takePicture(camera) {    
    //camera.pausePreview(); // there is curretly a bug with pausePreview which causes takePictureAsync to fail if you call it on Android pre taking a picture
    this.setState({ loading: true });

    //Set the options for the camera
    const options = {
      base64: true
    };
    
    Tts.speak("klurk")
    // Get the base64 version of the image
    camera.takePictureAsync(options)
      .then(data => {
        // data is your base64 string
        console.log("taking picture")        
        this.identifyImage(data.base64, camera);
      })
      .catch((error) => {
        // e is the error code
        console.log(error)
      })
      .finally(() => {
        //camera.resumePreview();
        this.setState({ loading: false }) // this will make the button clickable again
      })
  }

  pauseCamera(){
    //what is this actually doing??
    if ({loading: true}) {
      this.setState({loading: false})
    }    
  }

  componentDidMount() {
    //onload
    this.getJWTToken()
    this.setState({ initialTokenTime: Date.now() })
    this.changeKeepAwake(true)
  }

  getJWTToken() {    
    axios
      .get("https://assertion.herokuapp.com/")
      .then((response) => {
        const assertion = response.data
        console.log(response)
        axios({
          method: 'post',
          url: "https://www.googleapis.com/oauth2/v4/token",
          data: {
            "grant_type": "urn:ietf:params:oauth:grant-type:jwt-bearer",
            "assertion": assertion
          }
        })
          .then((response) => {
            this.setState({ bearerToken: response.data });
          })
      })
      .catch((error) => {
        console.log(error)
      })

  }

  identifyImage(imageData, camera) {
    console.log("identifying image!")
    const payload = {
      "payload": {
        "image": {
          "imageBytes": imageData
        },
      }
    };
    console.log("sending")
    axios({      
      method: 'post',
      url: "https://automl.googleapis.com/v1beta1/projects/totemic-ground-219514/locations/us-central1/models/ICN6280896592581654906:predict",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + this.state.bearerToken.access_token
      },
      data: payload
    })
      .then((response) => {
        this.setState({ mlresults: response.data })
        console.log("setting mlresutls")
      })
      .catch((error) => {
        console.log(error.response)
      })
      .then(() => {
        this.speakResults()
        this.takePicture(this.camera)        
      })
      .catch((error) => {
        console.log(error)
      })      
  }

  speakResults() {
    console.log("speak those results");
    let ADN = [];
    ADN = this.state.mlresults.payload.filter((element) =>
      element.classification.score > 0.9);
    console.log(ADN);
    let results = {}; 
    ADN.forEach((element) => {
      if (element.displayName == "J"){
          results.face = "Jack"
        }
        else if ( element.displayName == "A"){
          results.face = "Ace"
        }
        else if (element.displayName == "K"){
          results.face = "King"
        }
        else if (element.displayName == "Q"){
          results.face = "Queen"
        }
        else if (element.displayName.toLowerCase() == "heart") {
          results.suit = "Hearts"
        }
        else if (element.displayName.toLowerCase() == "diamond") {
          results.suit = "Diamonds"
        }
        else if (element.displayName.toLowerCase() == "spade") {
          results.suit = "Spades"
        }
        else if (element.displayName.toLowerCase() == "club") {
          results.suit = "Clubs"
        }
        else {
          if (element.displayName != "Face" && element.displayName != "Black" && element.displayName != "Red" )
          {  
            results.face = element.displayName
          }
        }
    });
    if(results.face === undefined)
    {
      results.face = "Unknown"
    }
    if(results.suit === undefined)
    {
      results.suit = "Unknown"
    }
    if(results.face !== "Unknown" && results.suit !== "Unknown")
    {
      Tts.speak(`${results.face} of ${results.suit}`)
    }
  }

//<View >{Alert.alert('How to use Card Whisperer','Hold a playing card over the phone and tap the top half of the screen to start the camera. Wait until your card is read and then hold your next card over the phone. The camera will contnuously take photos unless you tap the bottom half of the screen to pause. Tap the top half of the screen to start the camera again')}</View>

  render() {
    
    return (
      <View style={styles.container}>
          <RNCamera 
            type={this.state.cameraType} mirrorImage={this.state.mirrorMode} 
            ref={ref => { this.camera = ref; }} style={styles.preview}>
            <CameraButton onClick={() => {this.takePicture(this.camera)}} />
          </RNCamera>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    
    backgroundColor: 'white'
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
  preview: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    height: Dimensions.get('window').height,
    width: Dimensions.get('window').width,
  },
  loadingIndicator: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  }
});