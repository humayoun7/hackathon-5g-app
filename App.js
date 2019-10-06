import React, { Component } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { StatusBar, TouchableOpacity, TouchableHighlight, Image, ScrollView, FlatList, Modal } from 'react-native';
import openSocket from 'socket.io-client';
import FbGrid from "react-native-fb-image-grid";

// export default function App() {
//   return (
//     <View style={styles.container}>
//       <Text>Hello world</Text>
//     </View>
//   );
// }
const serverURL = 'http://192.168.1.4:3000'
const socket = openSocket(serverURL);
const DEVICE_TYPE_CONTROL = 'control'
const DEVICE_TYPE_DISPLAY = 'display'

class App extends Component {

  constructor(props){
    super(props)
    this.state = {
      deviceName: '',
      deviceType: '', // control, display
      socketId: '',
      joined: false,
      showModal: false,
      availableDevices:[
        'test',
        'best',
      ],
      selectedDevices:[],
      showImage:`${serverURL}/images/img2.jpeg`,
      selectedImage:'',
      availableImages:  [
      "http://localhost:3000/images/img2.jpeg",
      "http://localhost:3000/images/img1.jpeg",
      "http://localhost:3000/images/sc.jpeg",
      "http://localhost:3000/images/img1.jpeg",
      "http://localhost:3000/images/img2.jpeg",
      "http://localhost:3000/images/img1.jpeg",
      "http://localhost:3000/images/sc.jpeg",
      "http://localhost:3000/images/img2.jpeg",
      "http://localhost:3000/images/img1.jpeg",
      "http://localhost:3000/images/sc.jpeg",
      "http://localhost:3000/images/img1.jpeg",
      "http://localhost:3000/images/img2.jpeg",
      "http://localhost:3000/images/img1.jpeg",
      "http://localhost:3000/images/sc.jpeg",
      "http://localhost:3000/images/img2.jpeg",
      "http://localhost:3000/images/img1.jpeg",
      "http://localhost:3000/images/sc.jpeg",
      "http://localhost:3000/images/img1.jpeg",
      "http://localhost:3000/images/img2.jpeg",
      "http://localhost:3000/images/img1.jpeg",
      "http://localhost:3000/images/sc.jpeg",
      "http://localhost:3000/images/img2.jpeg",
      "http://localhost:3000/images/img1.jpeg",
      "http://localhost:3000/images/sc.jpeg",
      "http://localhost:3000/images/img1.jpeg",
      "http://localhost:3000/images/img2.jpeg",
      "http://localhost:3000/images/img1.jpeg",
      "http://localhost:3000/images/sc.jpeg",
     ,]
    }
    this.onPressConfirm = this.onPressConfirm.bind(this)
    
    socket.on('users-updated', users => console.log('users from socket', users))
    socket.on('connect', () => this.setState({socketId: socket.id}) )
    socket.on('newContent',(data)=>{
      
      const {name} = data
      console.log('newImage event', name)
      this.setState({showImage:`${serverURL}/images/${name}`})
    })
  }
  componentDidMount() {
     StatusBar.setHidden(true);
  }
  onPressConfirm(){
    console.log('onPressConfirm clicked', this.state )
    fetch(`${serverURL}/join?deviceName=${this.state.deviceName}&deviceType=${this.state.deviceType}&socketId=${this.state.socketId}`)
    .then(response => response.json())
    .then(json => {
        console.log('response back is', json)
        if(this.state.deviceType === DEVICE_TYPE_CONTROL) {
         this.getImagesFromServer()
        }
        this.setState({joined:true})
      })
    .catch(err=> console.log(err))
  }

  getImagesFromServer(){
    const url = `${serverURL}/imagenames`
    fetch(url)
    .then(response => response.json())
    .then(names => {
      let imgUrls = []
      for(n of names){
        imgUrls.push(`${serverURL}/images/${n}`)
      }
      this.setState({availableImages:imgUrls, joined:true})
    })
    .catch(err=> console.log(err))
  }
  onPressImage (imageUrl) {
    // image Url is the image you have clicked.
    console.log(imageUrl)
    //get available devices and then show modal
    this.setState({showModal:true, selectedImage: imageUrl})
    fetch(`${serverURL}/availabledevices`)
    .then(response => response.json())
    .then(names => {
      this.setState({availableDevices:names})
    })
    .catch(err=> console.log(err))
  }
  onPressDeviceName (name) {
    // image Url is the image you have clicked.
    
    let selectedDevices = this.state.selectedDevices
    let isSelected = selectedDevices.indexOf(name) > -1
    if(isSelected){
      let index = selectedDevices.indexOf(name)
      selectedDevices.splice(index,1)
    } else {
      selectedDevices.push(name)
    }
    this.setState({selectedDevices})
    console.log(name, this.state.selectedDevices)
    
  }

  broadcastContent(){
   
    let body = {
      imageUrl:this.state.selectedImage,
      deviceNames: this.state.selectedDevices
    }
    var headers = new Headers({
			'Content-Type': 'application/json',
			Accept: 'application/json',
		});
    let opts = {
      method: 'post',
      headers,
      body: JSON.stringify(body)
    }
    fetch(`${serverURL}/pushcontent`, opts)
    .then(response => response.json())
    .then(names => {
      this.setState({showModal:false})
    })
    .catch(err=> console.log(err))
  }

  render(){
    return (
      <View style={styles.container}>
        { this.state.joined && this.state.deviceType === DEVICE_TYPE_DISPLAY ? <View style={styles.containerDisplay}> 
          <Text>disply time</Text>
          <Image source={{uri: this.state.showImage}} style={styles.image} />
        </View> : <View/>
        }

        { this.state.joined && this.state.deviceType === DEVICE_TYPE_CONTROL ? <View style={styles.containerControl}>
      
        <FlatList
            data={this.state.availableImages}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={()=>this.onPressImage(item)} style={{ flex: 1, flexDirection: 'column', justifyContent:'space-around', borderColor:"white", borderWidth:5 }} >
                <Image  style={styles.imageThumbnail} source={{ uri: item }} />
              </TouchableOpacity>
             
            )}
            //Setting the number of column
            numColumns={3}
            keyExtractor={(item, index) => index.toString()}
          />
          
          {/* <ScrollView style={styles.scrollView} >
            <FbGrid
              images={[
                "https://facebook.github.io/react-native/docs/assets/favicon.png",
                "https://facebook.github.io/react-native/docs/assets/favicon.png",
                "https://facebook.github.io/react-native/docs/assets/favicon.png",
                "https://facebook.github.io/react-native/docs/assets/favicon.png",
                "https://facebook.github.io/react-native/docs/assets/favicon.png",
                "https://facebook.github.io/react-native/docs/assets/favicon.png"
              ]}
              onPress={this.onPress}
            /> 
          </ScrollView> */}
        </View> : <View/>
        }
        { !this.state.joined && 
          <View >
            <Text>Enter Device name</Text>
            <TextInput
              style={{height: 40}}
              placeholder="Device Name"
              onChangeText={(deviceName) => this.setState({deviceName})}
              value={this.state.deviceName}
            />
          <TouchableOpacity 
            style={ this.state.deviceType === DEVICE_TYPE_DISPLAY? 
              styles.selectedButton: styles.button}
            onPress={()=>{this.setState({deviceType:DEVICE_TYPE_DISPLAY})}}
          >
            <Text>Display</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={ this.state.deviceType === DEVICE_TYPE_CONTROL? 
              styles.selectedButton: styles.button}
            onPress={()=>{this.setState({deviceType:DEVICE_TYPE_CONTROL})}}
          >
            <Text>Control</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.buttonConfirm}
            onPress={this.onPressConfirm}
          >
            <Text>Confirm</Text>
          </TouchableOpacity>
        </View>
        }
        { this.state.showModal &&
   
           <Modal
             animationType="slide"
             transparent={true}
             visible={this.state.modalVisible}
             onRequestClose={() => {
               Alert.alert('Modal has been closed.');
    
             }}>
             <View style={styles.modal}>
             <FlatList
              data={this.state.availableDevices}
              extraData={this.state}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={()=>this.onPressDeviceName(item)} style={this.state.selectedDevices.indexOf(item) > -1?styles.listItemSelected:styles.listItem} >
                 <Text style={{fontSize:50, padding:20,  }}>{item}</Text>
                {console.log('from list', this.state.selectedDevices)}
                </TouchableOpacity>
              
              )}
              keyExtractor={(item, index) => index.toString()}
          />
               <TouchableOpacity style={styles.button} onPress={()=>{this.broadcastContent()}}>
                 <Text>show</Text>
              </TouchableOpacity>
             </View>
           </Modal>
     

        }
       
        
      </View>
    );
  }
}

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    // justifyContent: 'center',
    //marginTop:50,
    flexDirection: 'column'
  },
  containerDisplay: {
    flex: 1,
    backgroundColor: 'black',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%'
  },
  containerControl: {
    // flex: 1,
    // backgroundColor: 'black',
    // alignItems: 'center',
    // justifyContent: 'center',
    width: 400,
    height: 900
  },
  button: {
    alignItems: 'center',
    backgroundColor: '#DDD',
    fontSize: 18,
    padding: 10,
    borderWidth: 1,
  },
  selectedButton: {
    alignItems: 'center',
    backgroundColor: 'lightblue',
    fontSize: 18,
    padding: 10,
    borderWidth: 1,
    borderColor: 'blue'
  },
  buttonConfirm: {
    marginTop: 20,
    alignItems: 'center',
    backgroundColor: '#DDD',
    fontSize: 18,
    padding: 10,
    borderWidth: 1,
  },
  image: {
    
    alignItems: 'center',
    backgroundColor: '#DDD',
    padding: 10,
    width: '100%',
    flex: 1
  },
  scrollView: {
    backgroundColor: 'pink',
    marginHorizontal: 20,
    flex: 1,
    backgroundColor: 'black',
    width: '100%'
  },
  imageThumbnail: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 50,
    height: 200,
    width: 300,
    
  },
  modal: {
    flex:1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 50, 
    backgroundColor:'red'
    
  },
  listItem: { 
    fontSize:20, 
    flex: 1, 
    width:350,
    backgroundColor:'yellow', 
    margin:10, 
    flexDirection: 'row', 
    borderColor:"green", 
    borderWidth:1 
  },
  listItemSelected: { 
    fontSize:20, 
    flex: 1, 
    width:350,
    backgroundColor:'blue', 
    margin:10, 
    flexDirection: 'row', 
    borderColor:"green", 
    borderWidth:1 
  },
});
