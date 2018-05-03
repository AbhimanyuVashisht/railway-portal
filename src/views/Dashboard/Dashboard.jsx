import React from "react";
import PropTypes from "prop-types";
import { withStyles, Grid } from "material-ui";
import {Timeline, TimelineEvent } from 'react-event-timeline';
import {
    Button,
    CustomInput,
    ProfileCard,
    RegularCard,
    ItemGrid,
    Snackbar,
} from "components";

import dashboardStyle from "assets/jss/material-dashboard-react/dashboardStyle";

import avatar from "assets/img/faces/avatar2.png";
import {AddAlert} from "@material-ui/icons/index";
import * as firebase from 'firebase';
let axios = require('axios');
let axiosConfig = require('config/Axios/axios.js');

class Dashboard extends React.Component {
  constructor(props){
      super(props);
      this.state = {
          locationTimeLine: [],
          trainID: null,
          dataFetchError: false,
          isLoading: false,
          notification: false,
          username: JSON.parse(sessionStorage.getItem('user'))? JSON.parse(sessionStorage.getItem('user')).name : 'USER',
          notificationMessage: '',
      };

      this.handleInputChange = this.handleInputChange.bind(this);
      this.fetchInputDetails = this.fetchInputDetails.bind(this);
  }

  config = {
        apiKey: "AIzaSyAk8XjZ_NlOHlVEk2HQ9pIxBQzmd4IbsWw",
        authDomain: `portal-3401.firebaseapp.com`,
        databaseURL: `https://portal-3401.firebaseio.com`,
        projectId: "portal-3401",
        storageBucket: `portal-3401.appspot.com`,
        // messagingSenderId: secret.MESSAGING_SENDER_ID
  };


  componentDidMount(){
      this.user = JSON.parse(sessionStorage.getItem('user'));
      this.auth = sessionStorage.getItem('x-auth');
      firebase.initializeApp(this.config);
      this.notificationRecieved = firebase.database().ref('/station');
      this.notificationRecieved.on('value', (snapShot) =>  {
          let notification  = snapShot.val();
          if(this.user.station !== 0){
              if(notification[this.user.station]){
                  this.setState({
                      notification: true,
                      notificationMessage: notification[this.user.station].trainId
                  })
              }
          }
      })
  }

  componentWillUnmount(){
      this.notificationRecieved.off()
  }

  handleInputChange(newValue){
    this.setState({
        trainID: newValue
    })
  }

  fetchInputDetails(){
      this.setState({
          isLoading: true
      });
      if(this.auth){
          axiosConfig.headers['x-origin'] = this.user.role;
          axiosConfig.headers['x-auth'] = this.auth;
      }
      axios.get(`/tracks/${parseInt(this.state.trainID)}`, axiosConfig)
          .then((response) => {
              response = response.data;
              if(response.error){
                  this.setState({
                      dataFetchError: true
                  });
              }else {
                  let checkpoints = response.data.scheduleTrain;
                  let runningStatus = response.data.runningStatus;
                  let indexToPush;
                  for(let i in checkpoints) {
                      if(checkpoints[i].stationId === runningStatus.stationId){
                          indexToPush = i - 1;
                          break;
                      }
                  }

                  checkpoints.splice(indexToPush, 0, runningStatus);
                  this.setState({
                      locationTimeLine: checkpoints,
                      isLoading: false
                  });
              }

          }).catch((err) => console.log(err));
  }

  render() {
    return (
      <div>
        <Grid container>
            <Snackbar
                place="tr"
                color="info"
                icon={AddAlert}
                message={this.state.notificationMessage}
                open={this.state.notification}
                closeNotification={() => this.setState({ notification: false })}
            />
            <ItemGrid xs={12} sm={12} md={8}>
                <RegularCard
                    cardTitle="Enter Train Number to Track"
                    content={
                        <div>
                            <Grid container>
                                <ItemGrid xs={12} sm={12} md={4}>
                                    <CustomInput
                                        labelText="Train ID"
                                        id="train-id"
                                        formControlProps={{
                                            fullWidth: true
                                        }}
                                        onChange={this.handleInputChange}
                                    />
                                </ItemGrid>
                            </Grid>
                        </div>
                    }
                    footer={<Button color="primary" onClick={this.fetchInputDetails}>Submit</Button>}
                />
            </ItemGrid>
            <ItemGrid xs={12} sm={12} md={4}>
                <ProfileCard
                    avatar={avatar}
                    title={this.state.username}
                />
            </ItemGrid>
        </Grid>
          <Grid container>
              <ItemGrid xs={12} sm={12} md={12}>
                  <Timeline>
                      {
                          this.state.locationTimeLine.length > 0 ? this.state.locationTimeLine.map((value, index) => {
                              if(value.time){
                                  return (
                                      <TimelineEvent title={"Current Location"}
                                                     icon={<i className="material-icons md-18">my_location</i>}
                                                     key={index}
                                      >
                                          Time to reach next station {value.time}
                                      </TimelineEvent>
                                  )
                              }else {
                                  return (
                                      <TimelineEvent title={value.stationDetail.stationName}
                                                     icon={<i className="material-icons md-18">location_on</i>}
                                                     key={index}
                                      >
                                          Next Station will come after  l     {value.distanceFromNextStation} km
                                      </TimelineEvent>
                                  )

                              }
                          }) : null
                      }
                  </Timeline>
              </ItemGrid>
          </Grid>
      </div>
    );
  }
}

Dashboard.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(dashboardStyle)(Dashboard);
