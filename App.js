import { StatusBar } from 'expo-status-bar';
import React, { Component, useState } from 'react';
import { render } from 'react-dom';
import { StyleSheet, Dimensions, Text, View, Switch, Image, TextInput, TouchableOpacity, ActivityIndicator, CheckBox, ScrollView, Linking } from 'react-native';
import { Button} from 'react-native-elements';
import firebase from './firebase.js'
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Font from 'expo-font';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { NavigationContainer } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';

const win = Dimensions.get('window');

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

class Login extends Component{
  constructor(props){
    
    super(props);
    this.goToLogin = this.goToLogin.bind(this);
    this.goToRegister = this.goToRegister.bind(this);
    this.goToReset = this.goToReset.bind(this);
    this.login = this.login.bind(this);
    this.register = this.register.bind(this);
    this.resetPassword = this.resetPassword.bind(this);
    this.state = {
      display: "",
      email: "",
      password: "",
      password2: "",
      mode: 'register',
    };
  }

  goToRegister(){
    this.setState({
      display: "",
      email: "",
      password: "",
      password2: "",
      mode: 'register',
    });
  }

  goToLogin(){
    this.setState({
      display: "",
      email: "",
      password: "",
      password2: "",
      mode: 'login',
    });
  }

  goToReset(){
    this.setState({
      display: "",
      email: "",
      password: "",
      password2: "",
      mode: 'reset',
    });
  }

  resetPassword(){
    let email = this.state.email;
    firebase.auth().sendPasswordResetEmail(email)
      .then(() => {
        this.goToLogin();
        alert("Reset link sent successfully. Check your inbox for the reset link.")
      })
      .catch((error) => {
        var errorCode = error.code;
        var errorMessage = error.message;
        alert(errorMessage);
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
          user.updateProfile({
            displayName: display,
          });
          let db = firebase.database().ref().child("users").child(user.uid);
          db.set({
            name: display,
            points: 0,
            uid: user.uid,
            inProgress:[],
            complete:[],
          });
          return;
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
        this.props.loginHandler(user);
      })
      .catch((error) => {
        var errorCode = error.code;
        var errorMessage = error.message;
        alert(errorMessage);
      });
  }

  render(){
    if(this.state.mode == 'register'){
    return(
      <View>
        <Image source={require("./assets/mec_logo.png")} style={styles.logoImage} resizeMode="contain"/>
        <TextInput id="displayName" onChangeText={(display) => this.setState({display})} style={styles.textInput} placeholder="Display Name"/>
        <TextInput id="email" onChangeText={(email) => this.setState({email})} style={styles.textInput} placeholder="Email Address"/>
        <TextInput id="password1" secureTextEntry={true} onChangeText={(password) => this.setState({password})} style={styles.textInput} placeholder="Password"/>
        <TextInput id="password2" secureTextEntry={true} onChangeText={(password2) => this.setState({password2})} style={styles.textInput} placeholder="Confirm Password"/>
        <Button id="register" onPress={this.register} titleStyle={styles.buttonTitle} buttonStyle={styles.button} title="REGISTER"/>
        <TouchableOpacity onPress={this.goToLogin}><Text style={styles.link}>Already have an account? Login.</Text></TouchableOpacity>
      </View>
    );
    } else if(this.state.mode == 'login'){
      return(
        <View>
        <Image source={require("./assets/mec_logo.png")} style={styles.logoImage} resizeMode="contain"/>
        <TextInput id="email" onChangeText={(email) => this.setState({email})} style={styles.textInput} placeholder="Email Address"/>
        <TextInput id="password" secureTextEntry={true} onChangeText={(password) => this.setState({password})} style={styles.textInput} placeholder="Password"/>
        <Button id="login" onPress={this.login} titleStyle={styles.buttonTitle} buttonStyle={styles.button} title="LOG IN"/>
        <TouchableOpacity onPress={this.goToReset}><Text style={styles.link}>Forgot password?</Text></TouchableOpacity>
        <TouchableOpacity onPress={this.goToRegister}><Text style={styles.link}>Need an account? Register.</Text></TouchableOpacity>
        </View>
      );
    } else if(this.state.mode == 'reset'){
      return(
        <View>
        <Image source={require("./assets/mec_logo.png")} style={styles.logoImage} resizeMode="contain"/>
        
        <TextInput id="email" onChangeText={(email) => this.setState({email})} style={styles.textInput} placeholder="Email Address"/>
        <Button id="reset" onPress={this.resetPassword} titleStyle={styles.buttonTitle} buttonStyle={styles.button} title="SEND RESET LINK"/>
        <TouchableOpacity onPress={this.goToLogin}><Text style={styles.link}>Back to login</Text></TouchableOpacity>
        </View>
      );
    }
  }
}

class SelectTasks extends Component{
  constructor(props){
    super(props);
    this.addTask = this.addTask.bind(this);
    this.selectTasks = this.selectTasks.bind(this);
    this.state = {
      tasks: null,
      selectedTasks: [],
    };
  }

  addTask(task){
    let index = this.state.selectedTasks.indexOf(task);
    let tempSelectedTasks = this.state.selectedTasks;
    if(index > -1){
     tempSelectedTasks.splice(index, 1);
    } else {
     tempSelectedTasks.push(task);
    }
    this.setState({selectedTasks: tempSelectedTasks});
    //console.log(this.state.selectedTasks);
  }

  selectTasks(){
    let currUser = firebase.auth().currentUser;
    let uid = currUser.uid;
    let dbInProg = firebase.database().ref().child("users").child(uid).child("inProgress");
    let dbComplete = firebase.database().ref().child("users").child(uid).child("complete");
    let categories = []

    this.state.selectedTasks.forEach(function(task){
      //console.log(task);
      //console.log(task["category"]);
      if(categories.indexOf(task.category) == -1){
        categories.push(task.category);
      }});
    //console.log(categories);
    if(categories.length >= 4){
      dbInProg.set(this.state.selectedTasks);
      dbComplete.set([]);
      if(this.props.selectHandler){
        this.props.selectHandler();
      } else {
        this.props.route.params.selectHandler();
        this.props.navigation.navigate('Dashboard');
      }
    } else {
      alert("Please select at least one task per category.")
    }
    
  }

  componentDidMount(){
    const dbRef = firebase.database().ref();
    let currUser = firebase.auth().currentUser;
    dbRef.child("tasks").get().then((snapshot) => {
      if (snapshot.exists()) {
        //console.log(snapshot);
        let tasks = snapshot.val();
        //console.log(tasks);
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
      <ScrollView style={styles.scrollView}>
        <Text style={styles.h2}>Choose My Tasks</Text>
        <Text style={styles.p}>Loading...</Text>
      </ScrollView>
    ) : (
      <View>
        <ScrollView style={styles.scrollView}>
          <Text style={styles.h2}>Choose My Tasks</Text>
          <Text style={styles.p}>Please select at least one per category.</Text>
          {Object.keys(this.state.tasks).map(task => (
            <CheckTask task={this.state.tasks[task]} handleAdd={this.addTask}/>
          ))}
        </ScrollView>
        <View style={styles.fixedView}>
          <Button onPress={this.selectTasks} buttonStyle={styles.buttonHover} titleStyle={styles.buttonTitle} title="SELECT"/>
        </View>
      </View>
    );
  }
}

class Dashboard extends Component{
  constructor(props){
    super(props);
    let currUser = firebase.auth().currentUser;
    this.handleCheck = this.handleCheck.bind(this);
    this.state = { 
      input: false,
      inProgress: [],
      complete: [],
      user: currUser,
      points: 0};
  }

  componentDidMount(){  
    const dbRef = firebase.database().ref();
    //let currUser = firebase.auth().currentUser;
    dbRef.child("users").child(this.state.user.uid).get().then((snapshot) => {
      if (snapshot.exists()) {
        let inProgress = snapshot.child("inProgress").val();
        let complete = snapshot.child("complete").val();
        let pointCount = 0;
        if(inProgress == null){
          inProgress = [];
        }
        if(complete == null){
          complete = [];
        } else{
          complete.forEach(function(task){
            pointCount += task.pointVal;
            });
        }

        let today = new Date();
        today.setHours(0,0,0,0);
        //console.log(today);
        const resetTasks = async () => {
          try {
            const value = await AsyncStorage.getItem('@last_opened'); 
            if(value != today.toString() || value == null) { // If the date last opened was not today 

              // Reset all tasks
              inProgress.forEach(function(task){
                task.streak = 0;
                if(task.data == "int" && task.input != null){
                  task.input = null;
                }
              });
              console.log("Flag");
              let pointsGained = 0;
              complete.forEach(function(task){
                pointsGained += task.pointVal;
                if(task.streak){
                  task.streak += 1;
                } else {
                  task.streak = 1;
                }
                if(task.data == "int" && task.input != null){
                  task.input = null;
                }
                });

              // Move all completed tasks to inProgress
              inProgress = inProgress.concat(complete);
              complete = [];

              //console.log(today);
              // Store the current date in date last opened
              const saveDate = async (today) => {
                console.log(today);
                try { await AsyncStorage.setItem('@last_opened', today) } 
                catch (e) { console.log(e); }}

              saveDate(today.toString());

              let uid = firebase.auth().currentUser.uid;
              let dbInProg = firebase.database().ref().child("users").child(uid).child("inProgress");
              let dbComplete = firebase.database().ref().child("users").child(uid).child("complete");
              dbInProg.set(inProgress);
              dbComplete.set(complete);

              dbRef.child("users").child(uid).get().then((snapshot) => {
                if (snapshot.exists()) {
                  let user = snapshot.val();
                  let newPoints = null;
                  if(user.points){
                    newPoints = user.points + pointsGained;
                  } else{
                    newPoints = pointsGained;
                  }
                  let dbUserPoints = firebase.database().ref().child("users").child(uid).child("points");
                  dbUserPoints.set(newPoints);
                } else {
                  console.log("No data available");
                }
              }).catch((error) => {
                console.error(error);
              });
              
            }
              
          } catch(e) {
            console.log(e); 
          }
        }

        resetTasks();
        this.setState({ inProgress: inProgress, complete: complete, points: pointCount });

        /* value == false || value == null || value != */

      } else {
        console.log("No data available");
      }
    }).catch((error) => {
      console.error(error);
    });
  }

  handleCheck(task, input){
    //console.log(task);
    task.input = input;
    let tempInProgress = this.state.inProgress;
    let tempComplete = this.state.complete;
    //console.log(this.state.complete);
    if(tempInProgress.indexOf(task) > -1){
      tempInProgress.splice(tempInProgress.indexOf(task), 1);
      tempComplete.push(task);
    } else{
      tempComplete.splice(tempComplete.indexOf(task), 1);
      tempInProgress.push(task);
    }
    let pointCount = 0;
    tempComplete.forEach(function(task){
      pointCount += task.pointVal
    });

    this.setState({ inProgress: tempInProgress, complete: tempComplete, points: pointCount });
    let uid = firebase.auth().currentUser.uid;
    let dbInProg = firebase.database().ref().child("users").child(uid).child("inProgress");
    let dbComplete = firebase.database().ref().child("users").child(uid).child("complete");
    dbInProg.set(this.state.inProgress);
    dbComplete.set(this.state.complete);
  }

  render(){

    if(this.state.inProgress == null && this.state.inProgress == [] && this.state.complete == null && this.state.complete == []){
      return(
        <Loading/>
      );
    } else if(this.state.inProgress != null && this.state.inProgress != [] && (this.state.complete == null || this.state.complete == [])){
      return(
        <ScrollView style={styles.scrollView}>
        <Image source={require("./assets/mec_logo.png")} style={styles.logoImage} resizeMode="contain"/>
        <Text style={styles.h1}>Welcome, {this.state.user.displayName}!</Text>
        <Text style={styles.h3}>You've earned {this.state.points} points today.</Text>
        <Text style={styles.h2}>In Progress</Text> 
        {Object.keys(this.state.inProgress).map(task => this.state.inProgress[task].data == "boolean" ? (
          <BooleanTask task={this.state.inProgress[task]} handleCheck={this.handleCheck} completed={false} />
        ) : (
          <IntTask task={this.state.inProgress[task]} handleCheck={this.handleCheck} completed={false}/>
        ))}
        <Text style={styles.h2}>Completed</Text>
        <Text style={styles.p}>Nothing here yet!</Text>
      </ScrollView>
      );
    } else if((this.state.inProgress == null || this.state.inProgress == []) && this.state.complete != null && this.state.complete != []){
      return(
        <ScrollView style={styles.scrollView}>
          <Image source={require("./assets/mec_logo.png")} style={styles.logoImage} resizeMode="contain"/>
          <Text style={styles.h1}>Welcome, {this.state.user.displayName}!</Text>
          <Text style={styles.h3}>You've earned {this.state.points} points today.</Text>
          <Text style={styles.h2}>In Progress</Text> 
          <Text style={styles.p}>Congrats! You're done for the day!</Text>
          <Text style={styles.h2}>Completed</Text>
          {Object.keys(this.state.complete).map(task => this.state.complete[task].data == "boolean" ? (
          <BooleanTask task={this.state.complete[task]} handleCheck={this.handleCheck} completed={true} />
        ) : (
          <IntTask task={this.state.complete[task]} handleCheck={this.handleCheck} completed={true}/>
        ))}
        </ScrollView>
      );
    } else{
      return(
        <ScrollView style={styles.scrollView}>
          <Image source={require("./assets/mec_logo.png")} style={styles.logoImage} resizeMode="contain"/>
          <Text style={styles.h1}>Welcome, {this.state.user.displayName}!</Text>
          <Text style={styles.h3}>You've earned {this.state.points} points today.</Text>
          <Text style={styles.h2}>In Progress</Text> 
          {Object.keys(this.state.inProgress).map(task => this.state.inProgress[task].data == "boolean" ? (
          <BooleanTask task={this.state.inProgress[task]} handleCheck={this.handleCheck} completed={false} />
        ) : (
          <IntTask task={this.state.inProgress[task]} handleCheck={this.handleCheck} completed={false}/>
        ))}
          <Text style={styles.h2}>Completed</Text>
          {Object.keys(this.state.complete).map(task => this.state.complete[task].data == "boolean" ? (
          <BooleanTask task={this.state.complete[task]} handleCheck={this.handleCheck} completed={true} />
        ) : (
          <IntTask task={this.state.complete[task]} handleCheck={this.handleCheck} completed={true}/>
        ))}
        </ScrollView>
      )
    }
    
  }
}

class IntTask extends Component{
  constructor(props){
    super(props);
    this.verify = this.verify.bind(this);
    switch(this.props.task.category){
      case 'Water':
        this.state = {input: this.props.task.input, backgroundColor: '#01b9f1'};
        break;
      case 'Electricity':
        this.state = {input: this.props.task.input, backgroundColor: '#FFC30D'};
        break;
      case 'Transportation':
        this.state = {input: this.props.task.input, backgroundColor: '#410098'};
        break;
      case 'Home':
        this.state = {input: this.props.task.input, backgroundColor: '#98C238'};
        break;
      default:
        this.state = {input: this.props.task.input, backgroundColor: '#98C238'};
        break;
    }
  }

  async verify(){
    await sleep(300);
    let comparison = this.props.task.comparison;
    let checkVal = this.props.task.checkVal;
    //console.log(this.state.input + " " + comparison + " " + checkVal);
    let verified = false;
    if(comparison == "<="){
      verified = this.state.input <= checkVal;
    } else if(comparison == ">="){
      verified = this.state.input >= checkVal;
    } else{
      verified = this.state.input == checkVal;
    }
    console.log(verified);
    console.log(this.props.completed)
    if(verified != this.props.completed){
      this.props.handleCheck(this.props.task, this.state.input);
    }
  }

  render(){

    return(
      <TouchableOpacity style={[styles.card, {
        backgroundColor: this.state.backgroundColor, shadowColor: this.state.backgroundColor,
        shadowOffset: {
          width: 0,
          height: 12,
        },
        shadowOpacity: 0.58,
        shadowRadius: 16.00,
        
        elevation: 24,}]}>
          <TextInput id="input" value={this.state.input} onChangeText={(input) => this.setState({input})} onBlur={this.verify} keyboardType = 'numeric' style={styles.cardInput} placeholder="0"/>
          <View style={styles.cardTextWrap}>
            <Text style={[styles.cardHeader]}>{this.props.task.name}</Text>
            <Text style={[styles.cardBody]}>{this.props.task.description}</Text>
            <Text style={[styles.cardNote]}>{this.props.task.note}</Text>
            <View style={styles.cardSmallWrap}>
              <Text style={[styles.cardCategory]}>{this.props.task.category}</Text>
              <Text style={[styles.cardSmall]}>{this.props.task.pointVal} points</Text>
              <Text style={[styles.cardSmall]}>Streak: {this.props.task.streak}</Text>
            </View>
          </View>
      </TouchableOpacity>
    );
  }
}

class BooleanTask extends Component{

  constructor(props){
    super(props);
    this.toggleSwitch = this.toggleSwitch.bind(this);
    switch(this.props.task.category){
      case 'Water':
        this.state = {input: this.props.completed, backgroundColor: '#01b9f1'};
        break;
      case 'Electricity':
        this.state = {input: this.props.completed, backgroundColor: '#FFC30D'};
        break;
      case 'Transportation':
        this.state = {input: this.props.completed, backgroundColor: '#410098'};
        break;
      case 'Home':
        this.state = {input: this.props.completed, backgroundColor: '#98C238'};
        break;
      default:
        this.state = {input: this.props.completed, backgroundColor: '#98C238'};
        break;
    }
  }

  async toggleSwitch(){
    this.setState({input: !this.props.completed});
    await sleep(300);
    this.setState({input: this.props.completed});
    this.props.handleCheck(this.props.task, this.state.input);
  }

  render(){
    return(
      <TouchableOpacity style={[styles.card, {backgroundColor: this.state.backgroundColor, 
        shadowColor: this.state.backgroundColor,
        shadowOffset: {
          width: 0,
          height: 12,
        },
        shadowOpacity: 0.58,
        shadowRadius: 16.00,
        
        elevation: 24,}]} onPress={this.toggleSwitch}>
          <Switch
            trackColor={{ false: "#767577", true: "#498d13"}}
            thumbColor={this.state.input ? "#adf427" : "#f4f3f4"}
            ios_backgroundColor="#3e3e3e"
            onValueChange={this.toggleSwitch}
            value={this.state.input}
            style={styles.switch}
          />
          <View style={styles.cardTextWrap}>
            <Text style={[styles.cardHeader]}>{this.props.task.name}</Text>
            <Text style={[styles.cardBody]}>{this.props.task.description}</Text>
            <Text style={[styles.cardNote]}>{this.props.task.note}</Text>
            <View style={styles.cardSmallWrap}>
              <Text style={[styles.cardCategory]}>{this.props.task.category}</Text>
              <Text style={[styles.cardSmall]}>{this.props.task.pointVal} points</Text>
              <Text style={[styles.cardSmall]}>Streak: {this.props.task.streak}</Text>
            </View>
          </View>
      </TouchableOpacity>
    );
  }
}

class CheckTask extends Component{

  constructor(props){
    super(props);
    this.check = this.check.bind(this);
    switch(this.props.task.category){
      case 'Water':
        this.state = {selected: false, backgroundColor: '#01b9f1'};
        break;
      case 'Electricity':
        this.state = {selected: false, backgroundColor: '#FFC30D'};
        break;
      case 'Transportation':
        this.state = {selected: false, backgroundColor: '#410098'};
        break;
      case 'Home':
        this.state = {selected: false, backgroundColor: '#98C238'};
        break;
      default:
        this.state = {selected: false, backgroundColor: '#98C238'};
        break;
    }
  }

  check(){
    this.setState({selected: !this.state.selected});
    this.props.handleAdd(this.props.task);
  }

  render(){
    return(
      <TouchableOpacity style={[styles.card, {
        backgroundColor: this.state.backgroundColor, shadowColor: this.state.backgroundColor,
        shadowOffset: {
          width: 0,
          height: 12,
        },
        shadowOpacity: 0.58,
        shadowRadius: 16.00,
        
        elevation: 24,}]} onPress={this.check}>
          <CheckBox
            value={this.state.selected}
            onValueChange={this.check}
            style={styles.checkbox}
          />
          <View style={styles.cardTextWrap}>
            <Text style={[styles.cardHeader]}>{this.props.task.name}</Text>
            <Text style={[styles.cardBody]}>{this.props.task.description}</Text>
            <View style={styles.cardSmallWrap}>
              <Text style={[styles.cardSmall]}>{this.props.task.category}</Text>
              <Text style={[styles.cardSmall]}>{this.props.task.pointVal} points</Text>
            </View>
          </View>
      </TouchableOpacity>
    );
  }
}

function Loading(){
  return(<ActivityIndicator size="large" color="#98C238" />);
}

class About extends React.Component{
  constructor(props){
    super(props);
    this.openMEC = this.openMEC.bind(this);
  }
  openMEC(){
    Linking.canOpenURL('https://montgomeryenergyconnection.org/').then(supported => {
      if (supported) {
        Linking.openURL('https://montgomeryenergyconnection.org/');
      } else {
        console.log("Don't know how to open URI: " + 'https://montgomeryenergyconnection.org/');
      }
    });
  }
  render(){
    return(
      <ScrollView style={[styles.scrollView]}>
        <Text style={styles.h1}>About This App</Text>
        <Text style={styles.p}>[MEC APP NAME] is a mobile app to encourage sustainable energy habits. The habits you build here will help you not help the planet, but also cut down on your electricity bill!</Text>
        <Text style={styles.p}>This app was initially developed for residents of Montgomery County, Maryland, but MEC's tasks will help you save energy regardless of where you're from.</Text>
        <Image source={require("./assets/mec_logo.png")} style={styles.logoImage} resizeMode="contain"/>
        <Text style={styles.h2}>About Montgomery Energy Connection</Text>
        <Text style={styles.p}>Montgomery Energy Connection is an outreach network and resource hub managed by the Department of Environmental Protection and the Department of Health and Human Services Office of Home Energy Programs. Its goal is to provide community-level education and assistance on energy efficiency to Montgomery County residents. Learn more on their website at <TouchableOpacity onPress={this.openMEC}><Text style={styles.link}>https://montgomeryenergyconnection.org/.</Text></TouchableOpacity></Text>
      </ScrollView>
    );
  }
}


const Drawer = createDrawerNavigator();

class App extends React.Component{
  constructor(props){
    super(props);
    this.goToDashboard = this.goToDashboard.bind(this);
    this.forceAppUpdate = this.forceAppUpdate.bind(this);
    this.handleRegister = this.handleRegister.bind(this);
    this.loadFonts = this.loadFonts.bind(this);
    this.state = {
      currUser: null,
      activity: 'login',
      fontsLoaded: false,
    };
  }

  goToDashboard(user){
    console.log("Going to Dashboard");
    this.setState({
      currUser: user,
      activity: 'dashboard',
    });
    //const navigation = useNavigation();
    //navigation.navigate('Dashboard');
  }

  async forceAppUpdate(){
    console.log("forcing update");
    this.setState({
      activity: 'loading'
    });
    await sleep(100);
    this.setState({
      activity: 'dashboard'
    });
  }

  handleRegister(user){
    this.setState({
      currUser: user,
      activity: 'selectTasks',
    });
  }

  async loadFonts() {
    await Font.loadAsync({

      'MyriadPro': require('./assets/fonts/MyriadPro-Regular.ttf'),
      'MyriadPro-Bold': require('./assets/fonts/MyriadPro-Bold.otf'),
      'MyriadPro-Light': require('./assets/fonts/MyriadPro-Light.otf'),

    });

    this.setState({ fontsLoaded: true,});
  }

  componentDidMount(){  
    this.loadFonts();
    let user = firebase.auth().currentUser;
    this.setState({
      currUser: user, 
    });
    if(user !== undefined && user !== null){
      this.setState({
        activity: 'dashboard',
      });
    }
  }

  render() {

    if(this.state.fontsLoaded){

      switch(this.state.activity){
        case 'dashboard':
          return(
              <NavigationContainer style={styles.container}>
                <Drawer.Navigator initialRouteName="Dashboard" screenOptions={{
                    headerStyle: {
                      backgroundColor: '#98C238',
                      alignContent: 'center',
                    },
                    headerTintColor: '#296391',
                    headerTitleStyle: {
                      fontWeight: 'bold',
                      alignSelf: 'center',
                    },
                    drawerActiveBackgroundColor: '#98C238',
                    drawerInactiveBackgroundColor: '#98C238',
                    drawerActiveTintColor: '#296391',
                    drawerStyle: {
                      backgroundColor: '#98C238',
                      fontWeight: 'bold',
                    }
                  }}>   
                    <Drawer.Screen name="Dashboard" component={Dashboard} />
                    <Drawer.Screen name="My Tasks" component={SelectTasks} initialParams={{ selectHandler: this.forceAppUpdate }} />
                    <Drawer.Screen name="About" component={About} />
                </Drawer.Navigator>
                <StatusBar style="auto" />
              </NavigationContainer>
          );
        case 'selectTasks':
          return(
            <View style={styles.container}>
              <SelectTasks selectHandler={this.goToDashboard}/>
              <StatusBar style="auto" />
            </View>
          );
        case 'loading':
          return(
          <View style={styles.container}>
             <Loading/>
             <StatusBar style="auto" />
          </View>
            );
        default:
          return(
            <View style={styles.container}>
              <Login loginHandler={this.goToDashboard} registerHandler={this.handleRegister}></Login>
              <StatusBar style="auto" />
            </View>
          );
      }
    }
    else{
      return(
        <View style={styles.container}>
           <Loading/>
           <StatusBar style="auto" />
        </View>
          );
    }
  }


}

const styles = StyleSheet.create({

  button: {
    backgroundColor: '#99ca3c',
    width: 0.8 * win.width,
    padding: 12,
    marginBottom: 12,
    borderRadius: 20,
    fontFamily: 'MyriadPro',
  },

  buttonHover: {
    backgroundColor: '#296391',
    width: 0.3 * win.width,
    padding: 12,
    borderRadius: 20,
    fontFamily: 'MyriadPro',
  },

  buttonTitle:{
    color: 'white',
    fontSize: 18,
    fontFamily: 'MyriadPro',
  },

  card: {
    backgroundColor: '#333',
    borderRadius: 25,
    width: '90%',
    padding: 15,
    marginBottom: 15,
    flexDirection: 'row',
    alignSelf: 'center',
  },

  cardBody: {
    color: '#fff',
    fontSize: 15,
    marginBottom: 8,
    fontFamily: 'MyriadPro',
  },

  cardCategory: {
    color: '#498d13',
    fontSize: 12,
    marginBottom: 3,
    flex: 1.5,
    fontFamily: 'MyriadPro',
  },

  cardHeader: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    fontFamily: 'MyriadPro',
  },

  cardInput:{
    maxWidth: 0.2 * win.width,
    maxHeight: 50,
    fontSize: 18,
    padding: 10,
    borderWidth: 1,
    marginBottom: 12,
    marginRight: 10,
    flex: 1,
    alignSelf: 'center',
    borderTopWidth: 0,
    borderRightWidth: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 2,
    borderColor: '#498d13',
    fontFamily: 'MyriadPro',
  },

  cardNote:{
    color: '#fff',
    fontSize: 10,
    marginBottom: 3,
    flex: 1, 
    marginBottom: 12,
    fontFamily: 'MyriadPro',
  },

  cardSmall: {
    color: '#498d13',
    fontSize: 12,
    marginBottom: 3,
    flex: 1,
    fontFamily: 'MyriadPro',
  },

  cardSmallWrap:{
    flexDirection: 'row',
  },

  cardTextWrap: {
    flex: 6,
    flexDirection: 'column',
  },

  checkbox: {
    alignSelf: "center",
    marginLeft: 10,
    textAlignVertical: 'center',
    flex: 1,
    transform: [{ scaleX: 1.2 }, { scaleY: 1.2 }],
  },

  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    width: win.width,
    marginTop: Constants.statusBarHeight,
    fontFamily: 'MyriadPro',
  },

  fixedView : {
    position: 'absolute',
    right: 0,
    bottom: 0,
    margin: 25,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },

  h1: {
    color: '#666',
    fontSize: 25,
    textAlign: 'center',
    marginBottom: 10,
    marginTop: 10,
  },

  h2: {
    color: '#666',
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 10,
    marginTop: 10,
  },

  h3: {
    color: '#666',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 10,
    marginTop: 10,
  },

  link: {
    fontSize: 15,
    textAlign: 'center',
    color: '#006ba6',
  },

  linkPress: {
    textDecorationLine: 'underline',
  },

  logoImage: {
    flex:1,
    alignSelf: 'center',
    maxHeight: 0.3 * win.height,
    aspectRatio: 1,
    alignContent: 'center',
  },

  myriadPro: {
    fontFamily: 'MyriadPro',
  },

  p: {
    color: '#666',
    fontSize: 15,
    textAlign: 'justify',
    marginBottom: 15,
    width: '90%',
    alignSelf: 'center',
    lineHeight: 25,
    fontFamily: 'MyriadPro',
  },

  scrollView:{
    width: win.width,
    flexGrow: 1,
    paddingHorizontal: '0%',
  },

  switch:{
    marginHorizontal: 10,
    textAlignVertical: 'center',
    flex: 1,
    flexWrap: 'wrap',
    transform: [{ rotate: '-90deg' }],
  },

  textInput:{
    maxWidth: 0.8 * win.width,
    fontSize: 18,
    padding: 12,
    borderWidth: 1,
    marginBottom: 12,
    borderRadius: 20,
  },

});

export default App;