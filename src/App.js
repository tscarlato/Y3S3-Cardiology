import React, { Component } from 'react';
import { StyleSheet, Alert, Modal, TouchableOpacity, Text, View, Dimensions, } from 'react-native';
import { RNCamera } from 'react-native-camera';
import CameraButton from './CameraButton';
import axios from 'axios';
import Tts from 'react-native-tts';
import KeepAwake from 'react-native-keep-awake';
import PauseButton from './PauseButton';


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
  // changeCameraType() {
  //   if (this.state.cameraType === 'back') {
  //     this.setState({
  //       cameraType: 'front',
  //       mirrorMode: true
  //     });
  //   } else {
  //     this.setState({
  //       cameraType: 'back',
  //       mirrorMode: false
  //     });
  //   }
  // }
 
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
      .catch((e) => {
        // e is the error code
        console.log(e)

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
      .get("http://192.168.1.98:8080/")
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
      .then(() => {
        this.speakResults()
        this.takePicture(this.camera) 
        

      })
      .catch((error) => {

        console.log(error.response)
      })
      
  }
  speakResults() {
    console.log("speak those results");
    let ADN = [];
    ADN = this.state.mlresults.payload.filter((element) =>
      element.classification.score > 0.9);
    console.log(ADN);  
      ADN.map((element) => {
        console.log("this is ADN.map");
        if (element.displayName != "Face" && element.displayName != "Black" && element.displayName != "Red" ){
          console.log(element.displayName);
          if (element.displayName == "J"){
          Tts.speak("Jack")
          }
          else if ( element.displayName == "A"){
            Tts.speak("Ace")
          }
          else if (element.displayName == "K"){
            Tts.speak("King")
          }
          else if (element.displayName == "Q"){
            Tts.speak("Queen")
          }
          else {
            Tts.speak(element.displayName)
          }
          
        }  
        
      })
  }

//<View >{Alert.alert('How to use Card Whisperer','Hold a playing card over the phone and tap the top half of the screen to start the camera. Wait until your card is read and then hold your next card over the phone. The camera will contnuously take photos unless you tap the bottom half of the screen to pause. Tap the top half of the screen to start the camera again')}</View>

  render() {
    
    return (
      <View style={styles.container}>
          <RNCamera 
            type={this.state.cameraType} mirrorImage={this.state.mirrorMode} 
            ref={ref => { this.camera = ref; }} style={styles.preview}>
            <CameraButton onClick={() => {this.takePicture(this.camera)}} />
            <PauseButton onClick={() => {this.pauseCamera(this.camera)}}/>
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
