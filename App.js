import { StatusBar } from 'expo-status-bar';
import React, { Component, useState } from 'react';
import { render } from 'react-dom';
import { StyleSheet, Dimensions, Text, View, Switch, Image, TextInput, TouchableOpacity, CheckBox } from 'react-native';
import { Button} from 'react-native-elements';
import firebase from './firebase.js'

const win = Dimensions.get('window');

class Login extends Component{
  constructor(props){
    super(props);
    this.switchMode = this.switchMode.bind(this);
    this.login = this.login.bind(this);
    this.register = this.register.bind(this);
    this.state = {
      display: "",
      email: "",
      password: "",
      password2: "",
      register: true,
    };
  }

  switchMode(){
    this.setState({
      display: "",
      email: "",
      password: "",
      password2: "",
      register: !this.state.register,
    });
  }

  register(){
      let display = this.state.display;
      let email = this.state.email;
      let password1 = this.state.password;
      let password2 = this.state.password2;
      if(password1 == password2 && password1.length > 6 && email.indexOf("@") != -1 && email.indexOf(".") != -1){
        firebase.auth().createUserWithEmailAndPassword(email, password1)
        .then((userCredential) => {
          // Signed in 
          var user = userCredential.user;
          this.props.registerHandler(user);
          alert("Registered");
          return user.updateProfile({
            displayName: display,
          });
        })
        .catch((error) => {
          var errorCode = error.code;
          var errorMessage = error.message;
          alert(errorMessage);
        });
    } else{
      alert("Error");
      if(password1 != password2){
        alert("Passwords must match");
      } else if(password1.length <= 6){
        alert("Password is too short");
      } else {
        alert("Invalid email address");
      }
    }
  }

  login(){
      let email = this.state.email;
      let password = this.state.password;
      firebase.auth().signInWithEmailAndPassword(email, password)
      .then((userCredential) => {
        // Signed in
        var user = userCredential.user;
        alert("Signed in as " + user.displayName);
        this.props.loginHandler(user);
      })
      .catch((error) => {
        var errorCode = error.code;
        var errorMessage = error.message;
        alert(errorMessage);
      });
  }

  render(){
    if(this.state.register){
    return(
      <View>
        <Image source={require("./assets/mec_logo.png")} style={styles.logoImage} resizeMode="contain"/>
        <TextInput id="displayName" onChangeText={(display) => this.setState({display})} style={styles.textInput} placeholder="Display Name"/>
        <TextInput id="email" onChangeText={(email) => this.setState({email})} style={styles.textInput} placeholder="Email Address"/>
        <TextInput id="password1" secureTextEntry={true} onChangeText={(password) => this.setState({password})} style={styles.textInput} placeholder="Password"/>
        <TextInput id="password2" secureTextEntry={true} onChangeText={(password2) => this.setState({password2})} style={styles.textInput} placeholder="Confirm Password"/>
        <Button id="register" onPress={this.register} titleStyle={styles.buttonTitle} buttonStyle={styles.button} title="REGISTER"/>
        <TouchableOpacity onPress={this.switchMode}><Text style={styles.link}>Already have an account? Login.</Text></TouchableOpacity>
      </View>
    );
    } else{
      return(
        <View>
        <Image source={require("./assets/mec_logo.png")} style={styles.logoImage} resizeMode="contain"/>
        <TextInput id="email" onChangeText={(email) => this.setState({email})} style={styles.textInput} placeholder="Email Address"/>
        <TextInput id="password" secureTextEntry={true} onChangeText={(password) => this.setState({password})} style={styles.textInput} placeholder="Password"/>
        <Button id="login" onPress={this.login} titleStyle={styles.buttonTitle} buttonStyle={styles.button} title="LOG IN"/>
        <TouchableOpacity onPress={this.switchMode}><Text style={styles.link}>Need an account? Register.</Text></TouchableOpacity>
        </View>
      );
    }
  }
}

class SelectTasks extends Component{
  constructor(props){
    super(props);
    this.state = {
      tasks: null,
    };
  }

  componentDidMount(){
    const dbRef = firebase.database().ref();
    let currUser = firebase.auth().currentUser;
    dbRef.child("tasks").get().then((snapshot) => {
      if (snapshot.exists()) {
        console.log(snapshot);
        let tasks = snapshot.val();
        console.log(tasks);
        this.setState({ tasks: tasks });
      } else {
        console.log("No data available");
      }
    }).catch((error) => {
      console.error(error);
    });
  }

  render(){
    return this.state.tasks === null || this.state.tasks === undefined ? (
      <View style={styles.container}>
        <Text style={styles.p}>Loading...</Text>
      </View>
    ) : (
      <View style={styles.container}>
        {Object.keys(this.state.tasks).map(task => (
          <CheckTask name={this.state.tasks[task].name} description={this.state.tasks[task].description} category={this.state.tasks[task].category}/>
        ))}
      </View>
    );
  }
}

class Dashboard extends Component{
  constructor(props){
    super(props);
    this.state = { 
      input: false,
      inProgress: null,
      complete: null };
  }

  componentDidMount(){  
    const dbRef = firebase.database().ref();
    let currUser = firebase.auth().currentUser;
    dbRef.child("users").child(currUser.uid).get().then((snapshot) => {
      if (snapshot.exists()) {
        let inProgress = snapshot.child("inProgress").val();
        let complete = snapshot.child("complete").val();
        this.setState({ inProgress: inProgress, complete: complete });
      } else {
        console.log("No data available");
      }
    }).catch((error) => {
      console.error(error);
    });
  }

  render(){

    
    return this.state.inProgress !== null && this.state.complete !== null && this.state.inProgres != undefined && this.state.complete != undefined ? (
      <View style={styles.container}>
        <Text style={styles.h1}>Welcome</Text>
        <Text style={styles.h2}>In Progress</Text> 
        {Object.keys(this.state.inProgress).map(task => (
          <BooleanTask name={task.name} description={task.description} />
        ))}
        <Text style={styles.h2}>Completed</Text>
        {Object.keys(this.state.complete).map(task => (
          <BooleanTask name={task.name} description={task.description} />
        ))}
      </View>
    ) : (
      <View style={styles.container}>
        <Text style={styles.h1}>Welcome</Text>
        <Text style={styles.h2}>In Progress</Text>
        <Text style={styles.p}>Loading...</Text>
        <Text style={styles.h2}>Completed</Text>
        <Text style={styles.p}>Loading...</Text>
      </View>
    );

  }

}

class IntTask extends Component{
  constructor(props){
    super(props);
    this.state = { input: false };
  }

  render(){

    return(
      <View style={styles.card}>
        <View style={{flexDirection:"row", flexWrap:'wrap'}}>
          <View style={styles.cardText}>
            <Text style={styles.cardText, styles.h2}>Testing testing 123</Text>
            <Text style={styles.p, styles.cardText}>asdlfja;lsdkfj</Text>
          </View>
        </View>
      </View>
    );
  }
}

class BooleanTask extends Component{

  constructor(props){
    super(props);
    this.toggleSwitch = this.toggleSwitch.bind(this);
    switch(this.props.category){
      case 'Water':
        this.state = {input: false, backgroundColor: '#a6cbff'};
        break;
      case 'Electricity':
        this.state = {input: false, backgroundColor: '#ffe96e'};
        break;
      case 'Transportation':
        this.state = {input: false, backgroundColor: '#81eb8f'};
        break;
      case 'Home':
        this.state = {input: false, backgroundColor: '#e0a169'};
        break;
      default:
        this.state = {input: false, backgroundColor: '#e0a169'};
        break;
    }
  }

  toggleSwitch(){
    this.setState({input: !this.state.input});
  }

  render(){
    return(
      <View style={[styles.card, {backgroundColor: this.state.backgroundColor}]}>
          <Switch
            trackColor={{ false: "#767577", true: this.state.backgroundColor }}
            thumbColor={this.state.input ? "#767577" : "#f4f3f4"}
            ios_backgroundColor="#3e3e3e"
            onValueChange={this.toggleSwitch}
            value={this.state.input}
          />
          <View style={styles.cardTextWrap}>
            <Text style={styles.cardHeader}>{this.props.name}</Text>
            <Text style={styles.cardBody}>{this.props.description}</Text>
          </View>
      </View>
    );
  }
}

class CheckTask extends Component{

  constructor(props){
    super(props);
    this.check = this.check.bind(this);
    switch(this.props.category){
      case 'Water':
        this.state = {selected: false, backgroundColor: '#a6cbff'};
        break;
      case 'Electricity':
        this.state = {selected: false, backgroundColor: '#ffe96e'};
        break;
      case 'Transportation':
        this.state = {selected: false, backgroundColor: '#81eb8f'};
        break;
      case 'Home':
        this.state = {selected: false, backgroundColor: '#e0a169'};
        break;
      default:
        this.state = {selected: false, backgroundColor: '#e0a169'};
        break;
    }
  }

  check(){
    this.setState({selected: !this.state.selected});
  }

  render(){
    return(
      <TouchableOpacity style={[styles.card, {backgroundColor: this.state.backgroundColor}]} onPress={this.check}>
          <CheckBox
            value={this.state.selected}
            onValueChange={this.check}
            style={styles.checkbox}
          />
          <View style={styles.cardTextWrap}>
            <Text style={styles.cardHeader}>{this.props.name}</Text>
            <Text style={styles.cardBody}>{this.props.description}</Text>
          </View>
      </TouchableOpacity>
    );
  }
}

class App extends React.Component{
  constructor(props){
    super(props);
    this.handleLogin = this.handleLogin.bind(this);
    this.handleRegister = this.handleRegister.bind(this);
    this.state = {
      currUser: null,
      activity: 'login',
    };
  }

  handleLogin(user){
    this.setState({
      currUser: user,
      activity: 'selectTasks',
    });
  }

  handleRegister(user){
    this.setState({
      currUser: user,
      activity: 'selectTasks',
    });
  }

  componentDidMount(){  
    let user = firebase.auth().currentUser;
    this.setState({
      currUser: user,
    });
    if(user !== undefined && user !== null){
      this.setState({
        activity: 'selectTasks',
      });
    }
  }

  render() {

    switch(this.state.activity){
      case 'dashboard':
        return(
          <View style={styles.container}>
            <Dashboard/>
            <StatusBar style="auto" />
          </View>
        );
      case 'selectTasks':
        return(
          <View style={styles.container}>
            <SelectTasks/>
            <StatusBar style="auto" />
          </View>
        );
      default:
        return(
          <View style={styles.container}>
            <Login loginHandler={this.handleRegister} registerHandler={this.handleRegister}></Login>
            <StatusBar style="auto" />
          </View>
        );
    }
  }

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    width: win.width,
  },

  card: {
    backgroundColor: '#333',
    borderRadius: 25,
    width: '90%',
    padding: 10,
    marginBottom: 5,
    flexDirection: 'row',
  },

  switch:{
    marginHorizontal: 10,
    textAlignVertical: 'center',
    flex: 1,
    flexWrap: 'wrap',
  },

  cardTextWrap: {
    flex: 3,
    flexDirection: 'column',
  },

  cardHeader: {
    color: '#666',
    fontSize: 20,
    fontWeight: '800',
  },

  cardBody: {
    color: '#666',
    fontSize: 15,
  },

  checkbox: {
    alignSelf: "center",
    textAlignVertical: 'center',
    flex: 0.5,
  },

  h2: {
    fontSize: 20,
    textAlign: 'center',
  },

  logoImage: {
    flex:1,
    alignSelf: 'center',
    maxHeight: 0.3 * win.height,
    aspectRatio: 1,
    alignContent: 'center',
  },

  textInput:{
    maxWidth: 0.8 * win.width,
    fontSize: 18,
    padding: 10,
    borderWidth: 1,
    marginBottom: 12,
  },

  buttonTitle:{
    color: 'white',
    fontSize: 18,
  },

  button: {
    backgroundColor: '#99ca3c',
    width: 0.8 * win.width,
    padding: 10,
    marginBottom: 12,
  },

  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  p: {
    fontSize: 15,
    textAlign: 'center',
  },

  link: {
    fontSize: 15,
    textAlign: 'center',
    color: '#006ba6',
  },

  linkPress: {
    textDecorationLine: 'underline',
  },

});

export default App;