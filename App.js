import { StatusBar } from 'expo-status-bar';
import React, { Component, useState } from 'react';
import { StyleSheet, Dimensions, Text, View, Switch, Image, TextInput, TouchableOpacity, ActivityIndicator, ScrollView, Linking } from 'react-native';
import { Button} from 'react-native-elements';
import firebase from './firebase.js'
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Font from 'expo-font';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { NavigationContainer } from '@react-navigation/native';

const win = Dimensions.get('window');

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

// Component for the login and register screen. The first thing users see upon opening the app, if they are not signed in.
class Login extends Component{
  constructor(props){
    
    super(props);
    this.goToLogin = this.goToLogin.bind(this);
    this.goToRegister = this.goToRegister.bind(this);
    this.goToReset = this.goToReset.bind(this);
    this.login = this.login.bind(this);
    this.register = this.register.bind(this);
    this.resetPassword = this.resetPassword.bind(this);
    this.showAbout = this.showAbout.bind(this);
    this.state = {
      display: "",
      email: "",
      password: "",
      password2: "",
      mode: 'register',
    };
  }

  // Functions to switch between the different "states" of the login screen.

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

  showAbout(){
    this.setState({
      display: "",
      email: "",
      password: "",
      password2: "",
      mode: 'about',
    });
  }

  // Reset the user's password if they forgot it.
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
        alert("Could not send reset link. Please try again.");
      });

  }

  // Register the user for an account.
  register(){
      let display = this.state.display;
      let email = this.state.email;
      let password1 = this.state.password;
      let password2 = this.state.password2;

      // If the passwords match and if they are more than six characters, and if the email address is properly formatted...
      if(password1 == password2 && password1.length > 6 && email.indexOf("@") != -1 && email.indexOf(".") != -1){

        // Authenticate the user with firebase.
        firebase.auth().createUserWithEmailAndPassword(email, password1)

        .then((userCredential) => {
          // The user is now signed in. Save their profile and send them a verification email.
          var user = userCredential.user;
          this.props.registerHandler(user);
          user.updateProfile({
            displayName: display,
          });
          user.sendEmailVerification();
          let db = firebase.database().ref().child("users").child(user.uid);
          db.set({
            name: display,
            points: {water: 0, transportation: 0, home: 0, electricity: 0},
            uid: user.uid,
            inProgress:[],
            complete:[],
          });

          // Store the user's credentials so that they remain signed in.
          AsyncStorage.setItem("@userEmail", email);
          AsyncStorage.setItem("@userPassword", password);

          return;
        })

        // Otherwise, display the error message.
        .catch((error) => {
          var errorCode = error.code;
          var errorMessage = error.message;
          alert(errorMessage);
        });
    } else{

      // Display error messages if the credentials are invalid.
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
        // The user is now signed in.
        var user = userCredential.user;

        // Store the user's credentials so that they remain signed in.
        AsyncStorage.setItem("@userEmail", email);
        AsyncStorage.setItem("@userPassword", password);

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
      <ScrollView style={[styles.scrollView]}>
        <Image source={require("./assets/mec_logo.png")} style={styles.logoImage} resizeMode="contain"/>
        <Text style={styles.h1}>Energy Link</Text>
        <TextInput id="displayName" onChangeText={(display) => this.setState({display})} style={styles.textInput} placeholder="Display Name"/>
        <TextInput id="email" onChangeText={(email) => this.setState({email})} style={styles.textInput} placeholder="Email Address"/>
        <TextInput id="password1" secureTextEntry={true} onChangeText={(password) => this.setState({password})} style={styles.textInput} placeholder="Password"/>
        <TextInput id="password2" secureTextEntry={true} onChangeText={(password2) => this.setState({password2})} style={styles.textInput} placeholder="Confirm Password"/>
        <Button id="register" onPress={this.register} titleStyle={styles.buttonTitle} buttonStyle={styles.button} title="REGISTER"/>
        <TouchableOpacity onPress={this.showAbout}><Text style={styles.link}>New here? Learn more!</Text></TouchableOpacity>
        <TouchableOpacity onPress={this.goToLogin}><Text style={styles.link}>Already have an account? Login.</Text></TouchableOpacity>
      </ScrollView>
    );
    } else if(this.state.mode == 'login'){
      return(
        <ScrollView style={[styles.scrollView]}>
        <Image source={require("./assets/mec_logo.png")} style={styles.logoImage} resizeMode="contain"/>
        <Text style={styles.h1}>Energy Link</Text>
        <TextInput id="email" onChangeText={(email) => this.setState({email})} style={styles.textInput} placeholder="Email Address"/>
        <TextInput id="password" secureTextEntry={true} onChangeText={(password) => this.setState({password})} style={styles.textInput} placeholder="Password"/>
        <Button id="login" onPress={this.login} titleStyle={styles.buttonTitle} buttonStyle={styles.button} title="LOG IN"/>
        <TouchableOpacity onPress={this.goToReset}><Text style={styles.link}>Forgot password?</Text></TouchableOpacity>
        <TouchableOpacity onPress={this.goToRegister}><Text style={styles.link}>Need an account? Register.</Text></TouchableOpacity>
        </ScrollView>
      );
    } else if(this.state.mode == 'reset'){
      return(
        <ScrollView style={[styles.scrollView]}>
        <Image source={require("./assets/mec_logo.png")} style={styles.logoImage} resizeMode="contain"/>
        <Text style={styles.h1}>Energy Link</Text>
        <Text style={styles.h2}>Forgot your password?</Text>
        <TextInput id="email" onChangeText={(email) => this.setState({email})} style={styles.textInput} placeholder="Email Address"/>
        <Button id="reset" onPress={this.resetPassword} titleStyle={styles.buttonTitle} buttonStyle={styles.button} title="SEND RESET LINK"/>
        <TouchableOpacity onPress={this.goToLogin}><Text style={styles.link}>Back to login</Text></TouchableOpacity>
        </ScrollView>
      );
    } else {
      return(
        <View><About/><TouchableOpacity onPress={this.goToRegister}><Text style={styles.h2}>Back</Text></TouchableOpacity></View>
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
      selectedTasks: {},
    };
  }

  // This method is passed as a prop (handleAdd) in CheckTask
  addTask(task, key){
    let tempSelectedTasks = this.state.selectedTasks;
    if(tempSelectedTasks[key] != null){
     delete tempSelectedTasks[key];
    } else {
     tempSelectedTasks[key] = task;
    }
    this.setState({selectedTasks: tempSelectedTasks});
  }

  selectTasks(){
    let currUser = firebase.auth().currentUser;
    let uid = currUser.uid;

    // Get database references for the user's tasks
    // (References - NOT the actual values)
    let dbInProg = firebase.database().ref().child("users").child(uid).child("inProgress");
    let dbComplete = firebase.database().ref().child("users").child(uid).child("complete");
    let categories = [];

    let selectedTasks = this.state.selectedTasks;

    Object.values(this.state.selectedTasks).forEach(function(task){

      console.log(task);

      // Count how many categories are represented by the selected tasks.
      if(categories.indexOf(task.category) == -1){
        categories.push(task.category);
      }});

      // Update the tasks list of the user has selected from all 4 categories.
      if(categories.length >= 4){

        let newTasks = {};
        let completedTasks = {};
        Object.keys(selectedTasks).forEach(taskKey => {
        
          let inProgress = this.state.inProgress;
          let complete = this.state.complete;

          // If the task is already in inProgress, keep it
          if(inProgress != null && inProgress != undefined && Object.keys(inProgress).indexOf(taskKey) != -1){
            newTasks[taskKey] = inProgress[taskKey];

          // If the task is already in complete, keep it
          } else if(complete != null && complete != undefined && Object.keys(complete).indexOf(taskKey) != -1){
            completedTasks[taskKey] = complete[taskKey];

          // Otherwise, add the new task
          } else {
            newTasks[taskKey] = selectedTasks[taskKey];
          }

        });

        dbInProg.set(newTasks);
        dbComplete.set(completedTasks);
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

    // Get the list of all tasks available.
    dbRef.child("tasks").get().then((snapshot) => {
      if (snapshot.exists()) {
        let tasks = snapshot.val();

        // Get the user's current tasks, if they exist.
        let currUser = firebase.auth().currentUser;
        let uid = currUser.uid;

        dbRef.child("users").child(uid).get().then((snapshot) => {
          let inProgress = {};
          let complete = {};
          if (snapshot.exists()) {
            inProgress = snapshot.child("inProgress").val();
            complete = snapshot.child("complete").val();
          }

          // Update the state to contain the available tasks and the user's currently selected tasks.
          this.setState({ tasks: tasks, inProgress: inProgress, complete: complete });
        });
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
          <Text style={styles.h3}>Please select at least one per category.</Text>
          {Object.keys(this.state.tasks).map(taskKey => (
            <CheckTask task={this.state.tasks[taskKey]} handleAdd={this.addTask} taskKey={taskKey}/>
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
          Object.values(complete).forEach(function(task){
            pointCount += task.pointVal;
            });
        }

        let today = new Date();
        today.setHours(0,0,0,0);
        //console.log(today);
        const resetTasks = async () => {
          try {
            const value = await AsyncStorage.getItem('@last_opened'); 
            if(value == today.toString() || value == null) { // If the date last opened was not today 

              // Reset all tasks
              inProgress.forEach(function(task){
                task.streak = 0;
                if(task.data == "int" && task.input != null){
                  task.input = null;
                }
              });
              //console.log("Flag");
              let pointsGained = {water: 0, transportation: 0, home: 0, electricity: 0};
              Object.values(complete).forEach(function(task){
                //console.log(task.category);
                if(task.category == "Water"){ pointsGained.water++; }
                else if (task.category == "Transportation") { pointsGained.transportation++; }
                else if (task.category == "Home"){ pointsGained.home++; }
                else if(task.category == "Electricity"){ console.log("electricity"); pointsGained.electricity++; }
                if(task.streak){
                  task.streak++;
                } else {
                  task.streak = 1;
                }
                if(task.data == "int" && task.input != null){
                  task.input = null;
                }
                });
              //console.log(pointsGained);
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
                    newPoints = {water: user.points.water + pointsGained.water,
                      transportation: user.points.transportation + pointsGained.transportation,
                      home: user.points.home + pointsGained.home,
                      electricity: user.points.electricity + pointsGained.electricity};
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

  // Move a task from inProgress to complete (or vice versa)
  handleCheck(taskKey, input){
    console.log(input);
    let task;
    let tempInProgress = this.state.inProgress;
    let tempComplete = this.state.complete;
    console.log(taskKey);

    // If the task is in in progress, swap it to complete
    if(tempInProgress[taskKey] != null && tempInProgress[taskKey] != undefined){ 
      task = tempInProgress[taskKey];
      console.log(task);
      task.input = input;
      tempComplete[taskKey] = task;
      delete tempInProgress[taskKey];

    // If the task is complete, swap it to in progress
    } else if(tempComplete[taskKey] != null && tempComplete[taskKey] != undefined){
      task = tempComplete[taskKey];
      console.log(task);
      task.input = input;
      tempInProgress[taskKey] = task;
      delete tempComplete[taskKey];
    }

    // Tally up the new point value
    let pointCount = 0;
    Object.values(tempComplete).forEach(function(task){
      pointCount += task.pointVal;
    });

    this.setState({ inProgress: {}, complete: {}, points: pointCount });
    this.setState({ inProgress: tempInProgress, complete: tempComplete, points: pointCount });
    let uid = firebase.auth().currentUser.uid;
    let dbInProg = firebase.database().ref().child("users").child(uid).child("inProgress");
    let dbComplete = firebase.database().ref().child("users").child(uid).child("complete");
    dbInProg.set(this.state.inProgress);
    dbComplete.set(this.state.complete);
  }

  render(){

    if(this.state.inProgress == null && this.state.inProgress == {} && this.state.complete == null && this.state.complete == {}){
      return(
        <Loading/>
      );
    } else if(this.state.inProgress != null && this.state.inProgress != {} && (this.state.complete == null || this.state.complete == {})){
      return(
        <ScrollView style={styles.scrollView}>
        <Image source={require("./assets/mec_logo.png")} style={styles.logoImage} resizeMode="contain"/>
        <Text style={styles.h1}>Welcome, {this.state.user.displayName}!</Text>
        <Text style={styles.h3}>You've earned {this.state.points} points today.</Text>
        <Text style={styles.h2}>In Progress</Text> 
        {Object.keys(this.state.inProgress).map(taskKey => this.state.inProgress[taskKey].data == "boolean" ? (
          <BooleanTask task={this.state.inProgress[taskKey]} taskKey={taskKey} handleCheck={this.handleCheck} completed={false} />
        ) : (
          <IntTask task={this.state.inProgress[taskKey]} taskKey={taskKey} handleCheck={this.handleCheck} completed={false}/>
        ))}
        <Text style={styles.h2}>Completed</Text>
        <Text style={styles.p}>Nothing here yet!</Text>
      </ScrollView>
      );
    } else if((this.state.inProgress == null || this.state.inProgress == {}) && this.state.complete != null && this.state.complete != {}){
      return(
        <ScrollView style={styles.scrollView}>
          <Image source={require("./assets/mec_logo.png")} style={styles.logoImage} resizeMode="contain"/>
          <Text style={styles.h1}>Welcome, {this.state.user.displayName}!</Text>
          <Text style={styles.h3}>You've earned {this.state.points} points today.</Text>
          <Text style={styles.h2}>In Progress</Text> 
          <Text style={styles.p}>Congrats! You're done for the day!</Text>
          <Text style={styles.h2}>Completed</Text>
          {Object.keys(this.state.complete).map(taskKey => this.state.complete[taskKey].data == "boolean" ? (
          <BooleanTask task={this.state.complete[taskKey]} taskKey={taskKey} handleCheck={this.handleCheck} completed={true} />
        ) : (
          <IntTask task={this.state.complete[taskKey]} taskKey={taskKey} handleCheck={this.handleCheck} completed={true}/>
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
          {Object.keys(this.state.inProgress).map(taskKey => this.state.inProgress[taskKey].data == "boolean" ? (
          <BooleanTask task={this.state.inProgress[taskKey]} taskKey={taskKey} handleCheck={this.handleCheck} completed={false} />
        ) : (
          <IntTask task={this.state.inProgress[taskKey]} taskKey={taskKey} handleCheck={this.handleCheck} completed={false}/>
        ))}
          <Text style={styles.h2}>Completed</Text>
          {Object.keys(this.state.complete).map(taskKey => this.state.complete[taskKey].data == "boolean" ? (
          <BooleanTask task={this.state.complete[taskKey]} taskKey={taskKey} handleCheck={this.handleCheck} completed={true} />
        ) : (
          <IntTask task={this.state.complete[taskKey]} taskKey={taskKey} handleCheck={this.handleCheck} completed={true}/>
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
    if(verified != this.props.completed){
      this.props.handleCheck(this.props.taskKey, this.state.input);
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
    this.props.handleCheck(this.props.taskKey, this.state.input);
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
    //console.log(this.props.taskKey);
    this.props.handleAdd(this.props.task, this.props.taskKey);
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

          <Switch
            trackColor={{ false: "#767577", true: "#498d13"}}
            thumbColor={this.state.selected ? "#adf427" : "#f4f3f4"}
            ios_backgroundColor="#3e3e3e"
            onValueChange={this.check}
            value={this.state.selected}
            style={styles.switch}
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
        <Text style={styles.h1}>Welcome to Energy Link!</Text>
        <Text style={styles.h2}>About this app</Text>
        <Text style={styles.p}>Energy Link is a mobile app to encourage sustainable energy habits. The habits you build here will help you not help the planet, but also cut down on your electricity bill!</Text>
        <Text style={styles.p}>To get started, simply create an account. You will be able to select a handful of habits for you and hour household focus on. Earn points by completing tasks each day, and you may be eligible to earn prizes!</Text>
        <Text style={styles.p}>This app was created for residents of Montgomery County, Maryland, but Energy Link's tasks will help you save energy regardless of where you live.</Text>
        <Image source={require("./assets/mec_logo.png")} style={styles.logoImage} resizeMode="contain"/>
        <Text style={styles.h2}>Montgomery Energy Connection</Text>
        <Text style={styles.p}>Montgomery Energy Connection is an outreach network and resource hub managed by the Department of Environmental Protection and the Department of Health and Human Services Office of Home Energy Programs. Its goal is to provide community-level education and assistance on energy efficiency to Montgomery County residents. Learn more on their website <TouchableOpacity onPress={this.openMEC}><Text style={styles.inlineLink}>montgomeryenergyconnection.org.</Text></TouchableOpacity></Text>
      </ScrollView>
    );
  }
}


class SignOut extends React.Component{
  constructor(props){
    super(props);
    this.props.route.params.signOut();
  }
  
  render() {
    return(
      <Loading/>
    );
  }
}

class Prize extends Component{
  constructor(props){
    super(props);
  }
  render(){
    return(
      <TouchableOpacity style={[styles.card, {
        shadowColor: '#98C238',
        shadowOffset: {
          width: 0,
          height: 12,
        },
        shadowOpacity: 0.58,
        shadowRadius: 16.00,
        
        elevation: 24,}]}>
        <Image source={{uri:this.props.prize.image}} style={styles.prizeImage} resizeMode="contain"></Image>
          <View style={styles.cardTextWrap}>
            <Text style={[styles.cardHeader]}>{this.props.prize.name}</Text>
            <Text style={[styles.cardBody]}>{this.props.prize.description}</Text>
            <Text style={[styles.cardBody]}>Points needed: {this.props.prize.pointsNeeded}</Text>
          </View>
      </TouchableOpacity>
    );
  }
}

class Prizes extends React.Component{
  constructor(props){
    super(props);
    this.openForm = this.openForm.bind(this);
    this.resendVer = this.resendVer.bind(this);
    this.state = {
      user: null,
      points: null,
      prizes: null,
    };
  }
  openForm(){
    Linking.canOpenURL('https://forms.gle/SQw2Euzu7nTJo9Qq5').then(supported => {
      if (supported) {
        Linking.openURL('https://forms.gle/SQw2Euzu7nTJo9Qq5');
      } else {
        console.log("Don't know how to open URI: " + 'https://forms.gle/SQw2Euzu7nTJo9Qq5');
      }
    });
  }
  resendVer(){
    let user = firebase.auth().currentUser;
    user.sendEmailVerification();
    alert("Verification link sent.")
    this.props.route.params.updateHandler();
    //this.props.navigation.navigate('Prizes');
    
  }
  componentDidMount(){
    let user = firebase.auth().currentUser;
    let db = firebase.database().ref();
    //let dbPrizes = firebase.database().ref().child("prizes");
    let points = {water: 0, transportation: 0, home: 0, electricity: 0};
    let prizes = {};
    db.get().then((snapshot) => {
      if (snapshot.exists()) {
        points = snapshot.child("users").child(user.uid).child("points").val();
        prizes = snapshot.child("prizes").val();
        this.setState({ user: user, points: points, prizes: prizes });
      } else {
        console.log("No data available");
        this.setState({ user: user, points: points, prizes: prizes });
      }
    }).catch((error) => {
      console.error(error);
    });
  }
  render(){
    if(this.state.user && this.state.user.emailVerified && this.state.prizes && this.state.prizes != undefined){
      return(
        <ScrollView style={styles.scrollView}>
          <Text style={styles.h1}>Prizes</Text>
          <Text style={styles.p}>Earn prizes through the points you get every time you complete a task. Note that prizes are only available to those in Montgomery County.</Text>
          <Button titleStyle={styles.buttonTitle} buttonStyle={styles.button} title="CLAIM A PRIZE" onPress={this.openForm}/>
          <Text style={styles.h2}>Your points: {this.state.points.water + this.state.points.electricity + this.state.points.transportation + this.state.points.home}</Text>
          <Text style={styles.h3}>Points gained for water: {this.state.points.water}</Text>
          <Text style={styles.h3}>Points gained for transportation: {this.state.points.transportation}</Text>
          <Text style={styles.h3}>Points gained for home: {this.state.points.home}</Text>
          <Text style={styles.h3}>Points gained for electricity: {this.state.points.electricity}</Text>
          <Text style={styles.h2}>Available Prizes</Text>
          {Object.keys(this.state.prizes).map(prize => (
            <Prize prize={this.state.prizes[prize]}/>
          ))}
        </ScrollView>
      );
    } else {
      return(
        <ScrollView style={styles.scrollView}>
          <Text style={styles.h3}>Please verify your email address to be eligible for prizes.</Text>
          <Button id="update" onPress={this.resendVer} titleStyle={styles.buttonTitle} buttonStyle={styles.button} title="RESEND EMAIL VERIFICATION"/>
        </ScrollView>
      )
    }

  }
}

class MyAccount extends React.Component {

  constructor(props){
    super(props);
    let user = firebase.auth().currentUser;
    this.update = this.update.bind(this);
    this.resendVer = this.resendVer.bind(this);
    this.switchMode = this.switchMode.bind(this);
    this.resetPassword = this.resetPassword.bind(this);
    this.state = {
      user: user,
      display: user.displayName,
      email: user.email,
      password: "",
      newPass1: "",
      newPass2: "",
      mode: 'account',
    };
  }

  resendVer(){
    let user = firebase.auth().currentUser;
    user.sendEmailVerification();
    alert("Verification link sent.")
  }

  update(){
    let user = firebase.auth().currentUser;
    let sendVerification = false;
    if(user.email != this.state.email){
      sendVerification = true;
    }
    firebase.auth().signInWithEmailAndPassword(user.email, this.state.password)
    .then((userCredential) => {
      let newUser = userCredential.user;
      if(sendVerification){
        user.updateEmail(this.state.email);
      }
      newUser.updateProfile({
        displayName: this.state.display,
      }).then(() => {
        if(sendVerification){
          newUser.sendEmailVerification();
          alert("Update successful. Please check your inbox to verify your new email address.");
          // Store the user's new email so that they remain signed in.
          AsyncStorage.setItem("@userEmail", user.email);
        } else {
          alert("Update successful.")
        }
        this.props.route.params.updateHandler();
        this.props.navigation.navigate('Dashboard');
      }).catch((error) => {
        alert(error);
      });  
    })
    .catch((error) => {
      var errorCode = error.code;
      var errorMessage = error.message;
      if(this.state.password == ""){
        alert("Please confirm your password before updating your account information.");
      } else {
        alert("Password is incorrect. Please try again.");
      }
    });
  }

  switchMode(){
    let user = firebase.auth().currentUser;
    if(this.state.mode == "account"){
      this.setState({
        display: user.displayName,
        email: user.email,
        password: "",
        newPass1: "",
        newPass2: "",
        mode: 'resetPass',
      });
    } else {
      this.setState({
        display: user.displayName,
        email: user.email,
        password: "",
        newPass1: "",
        newPass2: "",
        mode: 'account',
    });
  }
  }

  resetPassword(){

    let user = firebase.auth().currentUser;
    if(this.state.newPass1 == this.state.newPass2){
      firebase.auth().signInWithEmailAndPassword(user.email, this.state.password)
      .then((userCredential) => {
        let newUser = userCredential.user;
        newUser.updatePassword(this.state.newPass1).then(() => {
          alert("Your password has just been updated.");

          // Store the user's new credentials so that they remain signed in.
          AsyncStorage.setItem("@userPassword", password);

          this.switchMode();
        }).catch((error) => {
          alert("Could not reset password. Please make sure your new password is over 6 characters long.")
          //alert(error.message);
        });
      })
      .catch((error) => {
        var errorCode = error.code;
        var errorMessage = error.message;
        if(this.state.password == ""){
          alert("Please confirm your current password to change it.");
        } else {
          //alert(errorMessage);
          alert("Password is incorrect. Please try again.");
        }
      });
    } else {
      alert("New passwords don't match.")
    }
  }

  render(){
    if(this.state.mode == 'account' && this.state.user.emailVerified){
      return(
        <View>
          <Text style={styles.h1}>My Account</Text>
          <TextInput id="displayName" value={this.state.display} onChangeText={(display) => this.setState({display})} style={styles.textInput} placeholder="Display Name"/>
          <TextInput id="email" value={this.state.email} onChangeText={(email) => this.setState({email})} style={styles.textInput} placeholder="Email Address"/>
          <TextInput id="password1" secureTextEntry={true} onChangeText={(password) => this.setState({password})} style={styles.textInput} placeholder="Confirm password"/>
          <Button id="update" onPress={this.update} titleStyle={styles.buttonTitle} buttonStyle={styles.button} title="UPDATE"/>
          <Button id="update" onPress={this.switchMode} titleStyle={styles.buttonTitle} buttonStyle={styles.button} title="CHANGE PASSWORD"/>
        </View>
      );
    } else if(this.state.mode == 'account' && !this.state.user.emailVerified){
      return(
        <View>
        <Text style={styles.h1}>My Account</Text>
        <TextInput id="displayName" value={this.state.display} onChangeText={(display) => this.setState({display})} style={styles.textInput} placeholder="Display Name"/>
        <TextInput id="email" value={this.state.email} onChangeText={(email) => this.setState({email})} style={styles.textInput} placeholder="Email Address"/>
        <TextInput id="password1" secureTextEntry={true} onChangeText={(password) => this.setState({password})} style={styles.textInput} placeholder="Confirm password"/>
        <Button id="update" onPress={this.update} titleStyle={styles.buttonTitle} buttonStyle={styles.button} title="UPDATE"/>
        <Button id="update" onPress={this.switchMode} titleStyle={styles.buttonTitle} buttonStyle={styles.button} title="CHANGE PASSWORD"/>
        <Button id="update" onPress={this.resendVer} titleStyle={styles.buttonTitle} buttonStyle={styles.button} title="RESEND EMAIL VERIFICATION"/>
      </View>
      );
    } else{
      return(
        <View>
        <Text style={styles.h1}>My Account</Text>
        <TextInput id="oldPass" secureTextEntry={true} onChangeText={(password) => this.setState({password})} style={styles.textInput} placeholder="Current password"/>
        <TextInput id="newPass1" secureTextEntry={true} onChangeText={(newPass1) => this.setState({newPass1})} style={styles.textInput} placeholder="New password"/>
        <TextInput id="newPass2" secureTextEntry={true} onChangeText={(newPass2) => this.setState({newPass2})} style={styles.textInput} placeholder="Confirm new password"/>
        <Button id="update" onPress={this.resetPassword} titleStyle={styles.buttonTitle} buttonStyle={styles.button} title="RESET PASSWORD"/>
        <Button id="update" onPress={this.switchMode} titleStyle={styles.buttonTitle} buttonStyle={styles.buttonBlue} title="CANCEL"/>
      </View>
      );
    }
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
    this.signOut = this.signOut.bind(this);
    let user = firebase.auth().currentUser;
    
    if(user != undefined && user != null){
      this.state = {
        currUser: user,
        activity: 'dashboard',
        fontsLoaded: false,
      };
    } else {
      this.state = {
        currUser: null,
        activity: 'login',
        fontsLoaded: false,
      };
    }
    
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

  signOut(){
    firebase.auth().signOut().then(() => {
      AsyncStorage.clear();
      this.setState({
        currUser: null,
        activity: 'login',
      });
    }).catch((error) => {
      console.log(error);
    });
   
  }

  handleRegister(user){
    this.setState({
      currUser: user,
      activity: 'selectTasks',
    });
  }

  async loadFonts(user) {
    await Font.loadAsync({

      'MyriadPro': require('./assets/fonts/MyriadPro-Regular.ttf'),
      'MyriadPro-Bold': require('./assets/fonts/MyriadPro-Bold.otf'),
      'MyriadPro-Light': require('./assets/fonts/MyriadPro-Light.otf'),

    });

    if(user != null && user != undefined){
      this.setState({ currUser: user, activity: 'dashboard', fontsLoaded: true});
    } else {
      this.setState({ currUser: user, fontsLoaded: true});
    }
  }

  componentDidMount(){  

    if(this.state.currUser == undefined || this.state.currUser == null){

      // Get the user's credentials from storage, if exists
      const loginFromStorage = async () => {
          try{
            const email = await AsyncStorage.getItem("@userEmail");
            const password = await AsyncStorage.getItem("@userPassword");

            if(email != null && password != null){
              firebase.auth().signInWithEmailAndPassword(email, password)
              .then((userCredential) => {

                console.log("Signed in");
                let user = userCredential.user;
                this.loadFonts(user);
              })
              .catch((error) => { 
                let user = null;
                this.loadFonts(user);
              });
            } else {
              let user = null;
              this.loadFonts(user);
            }
          } catch(e){ 
            let user = null;
            this.loadFonts(user);
          }
        }
        loginFromStorage();
    } else {
      let user = this.state.currUser;
      this.loadFonts(user);
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
                    },
                    headerTitleStyle: {
                      alignContent: 'center',
                      fontFamily: 'MyriadPro',
                    },
                    headerTintColor: '#296391',
                    headerTitleStyle: {
                      fontWeight: 'bold',
                      alignSelf: 'center',
                      fontFamily: 'MyriadPro',
                    },
                    fontFamily: 'MyriadPro',
                    drawerActiveBackgroundColor: '#98C238',
                    drawerInactiveBackgroundColor: '#98C238',
                    drawerActiveTintColor: '#296391',
                    drawerInactiveTintColor: '#333',
                    drawerStyle: {
                      backgroundColor: '#98C238',
                      fontWeight: 'bold',
                      fontFamily: 'MyriadPro',
                    },
                    drawerLabelStyle: {
                      fontFamily: 'MyriadPro',
                      fontSize: 20,
                    }
                  }}>   
                    <Drawer.Screen name="Dashboard" component={Dashboard} />
                    <Drawer.Screen name="About" component={About} />
                    <Drawer.Screen name="Prizes" component={Prizes} initialParams={{ updateHandler: this.forceAppUpdate }} />
                    <Drawer.Screen name="My Tasks" component={SelectTasks} initialParams={{ selectHandler: this.forceAppUpdate }} />
                    <Drawer.Screen name="My Account" component={MyAccount} initialParams={{ updateHandler: this.forceAppUpdate }} />
                    <Drawer.Screen name="Sign Out" component={SignOut} initialParams={{ signOut: this.signOut }} />
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
    alignSelf: 'center',
  },

  buttonBlue: {
    backgroundColor: '#296391',
    width: 0.8 * win.width,
    padding: 12,
    marginBottom: 12,
    borderRadius: 20,
    fontFamily: 'MyriadPro',
    alignSelf: 'center',
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
    backgroundColor: '#98C238',
    borderRadius: 25,
    width: '90%',
    padding: 25,
    marginBottom: 15,
    flexDirection: 'row',
    alignSelf: 'center',
  },

  cardBody: {
    color: '#fff',
    fontSize: 18,
    marginBottom: 8,
    fontFamily: 'MyriadPro',
    textAlign: 'left',
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
    fontSize: 25,
    fontWeight: 'bold',
    marginBottom: 8,
    fontFamily: 'MyriadPro',
    textAlign: 'justify'
  },

  cardInput:{
    maxWidth: 0.2 * win.width,
    maxHeight: 50,
    fontSize: 20,
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
    fontSize: 15,
    marginBottom: 3,
    flex: 1, 
    marginBottom: 12,
    fontFamily: 'MyriadPro',
    textAlign: 'justify'
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
    color: '#98C238',
    fontSize: 30,
    textAlign: 'center',
    marginBottom: 10,
    marginTop: 10,
    fontFamily: 'MyriadPro-Bold',
    width: '90%',
    alignSelf: 'center',
  },

  h2: {
    color: '#296391',
    fontSize: 25,
    textAlign: 'center',
    marginBottom: 10,
    marginTop: 20,
    fontFamily: 'MyriadPro-Bold',
    width: '90%',
    alignSelf: 'center',
  },

  h3: {
    color: '#333',
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 10,
    marginTop: 10,
    fontFamily: 'MyriadPro',
    width: '90%',
    alignSelf: 'center',
  },

  inlineLink: {
    color: '#006ba6',
    fontSize: 17,
    textAlign: 'justify',
    width: '90%',
    alignSelf: 'center',
    fontFamily: 'MyriadPro',
  },

  link: {
    fontSize: 17,
    textAlign: 'center',
    color: '#006ba6',
    fontFamily: 'MyriadPro',
    lineHeight: 25,
    marginBottom: 0,
  },

  linkPress: {
    textDecorationLine: 'underline',
    fontFamily: 'MyriadPro',
  },

  logoImage: {
    height: 0.4 * win.width,
    alignSelf: 'center',
    aspectRatio: 1,
    alignContent: 'center',
    marginBottom: 0,
  },

  p: {
    color: '#333',
    fontSize: 17,
    textAlign: 'justify',
    marginBottom: 15,
    width: '90%',
    alignSelf: 'center',
    lineHeight: 25,
    fontFamily: 'MyriadPro',
  },

  prizeImage: {
    width: '25%',
    maxHeight: 200,
    marginRight: 15,
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
    width: 0.8 * win.width,
    fontSize: 18,
    padding: 12,
    borderWidth: 1,
    marginBottom: 12,
    borderRadius: 20,
    fontFamily: 'MyriadPro',
    alignSelf: 'center',
  },

});

export default App;