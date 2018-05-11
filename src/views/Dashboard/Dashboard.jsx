import React from "react";
import PropTypes from "prop-types";
import { withStyles, Grid } from "material-ui";
import { Header, Table, Button} from 'semantic-ui-react';

import {Timeline, TimelineEvent } from 'react-event-timeline';
import {
    RegularCard,
    CustomInput,
    ProfileCard,
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
          trainID: null,
          locationTimeLine: [],
          dataFetchError: false,
          isLoading: false,
          notification: false,
          username: JSON.parse(sessionStorage.getItem('user'))? JSON.parse(sessionStorage.getItem('user')).name : 'USER',
          station: JSON.parse(sessionStorage.getItem('user')) ? JSON.parse(sessionStorage.getItem('user')).station : null,
          notificationMessage: '',
          trainTable: [78456, 45678, 39250],
          completeDetail: {},
          show: false,
      };
      this.handleInputChange = this.handleInputChange.bind(this);
      this.fetchInputDetails = this.fetchInputDetails.bind(this);
      this.showMessage = this.showMessage.bind(this);
  }

  config = {
        apiKey: "AIzaSyAk8XjZ_NlOHlVEk2HQ9pIxBQzmd4IbsWw",
        authDomain: `portal-3401.firebaseapp.com`,
        databaseURL: `https://portal-3401.firebaseio.com`,
        projectId: "portal-3401",
        storageBucket: `portal-3401.appspot.com`,
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
                  let table = this.state.trainTable;
                  let flag = 0;
                  table.map(value => {
                      if(value == this.state.trainTable){
                          flag = 1;
                      }
                      console.log('Hello');
                  });
                  if(flag === 0){
                      table.splice(0, 0, notification[this.user.station].trainId);
                  }
                  console.log('dgjvhgv');
                  this.setState({
                      trainTable: table,
                      notification: true,
                      notificationMessage: notification[this.user.station].trainName + '\n('+  notification[this.user.station].trainId + ')',
                      completeDetail: notification[this.user.station]
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

  fetchInputDetails(trainId){
      if(this.auth){
          axiosConfig.headers['x-origin'] = this.user.role;
          axiosConfig.headers['x-auth'] = this.auth;
      }
      console.log(trainId);
      axios.get(`/tracks/${parseInt(trainId)}`, axiosConfig)
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
                      if(checkpoints[i].stationDetail.stationId === runningStatus.stationId){
                          console.log('Hello');
                          indexToPush = i;
                          break;
                      }
                  }

                  console.log(indexToPush);
                  if(indexToPush === 1){
                      checkpoints.splice(2, 0, runningStatus);
                  }else {
                      checkpoints.splice(indexToPush, 0, runningStatus);
                  }
                  this.setState({
                      locationTimeLine: checkpoints,
                  });
              }
          }).catch((err) => console.log(err));
  }

  showMessage(){
    this.setState({
        show: true,
    })
  }

  render() {
    return (
      <div>
        <Grid container>
            <Snackbar
                place="tc"
                color="info"
                icon={AddAlert}
                message={<Button onClick={this.showMessage}>{this.state.notificationMessage}</Button>}
                open={this.state.notification}
                closeNotification={() => this.setState({ notification: false })}
                close
            />
            <ItemGrid xs={12} sm={8} md={8}>
                {
                    this.state.show ? <Button basic icon="chevron left" onClick={() => this.setState({show: false})}/> : null
                }
                {
                    this.state.show? (
                        <Table basic='very' celled>
                            <Table.Header>
                                <Table.Row colspan={2}>
                                    <Table.HeaderCell>Train Detail</Table.HeaderCell>
                                    <Table.HeaderCell></Table.HeaderCell>
                                </Table.Row>
                            </Table.Header>
                            <Table.Body>
                                <Table.Row>
                                    <Table.Cell>
                                        <Header.Content>
                                            Train ID
                                        </Header.Content>
                                    </Table.Cell>
                                    <Table.Cell>
                                        <Header.Content>
                                            {this.state.show ? this.state.completeDetail.trainId : null}
                                        </Header.Content>
                                    </Table.Cell>
                                </Table.Row>
                                <Table.Row>
                                    <Table.Cell>
                                        <Header.Content>
                                            Time To Reach
                                        </Header.Content>
                                    </Table.Cell>
                                    <Table.Cell>
                                        <Header.Content>
                                            {this.state.show ? this.state.completeDetail.time : null}
                                        </Header.Content>
                                    </Table.Cell>
                                </Table.Row>
                                <Table.Row>
                                    <Table.Cell>
                                        <Header.Content>
                                            Destination Station
                                        </Header.Content>
                                    </Table.Cell>
                                    <Table.Cell>
                                        <Header.Content>
                                            {this.state.show ? this.state.completeDetail.destinationStation : null}
                                        </Header.Content>
                                    </Table.Cell>
                                </Table.Row>
                                <Table.Row>
                                    <Table.Cell>
                                        <Header.Content>
                                            Origin Station
                                        </Header.Content>
                                    </Table.Cell>
                                    <Table.Cell>
                                        <Header.Content>
                                            {this.state.show ? this.state.completeDetail.originStation : null}
                                        </Header.Content>
                                    </Table.Cell>
                                </Table.Row>
                                <Table.Row>
                                    <Table.Cell>
                                        <Header.Content>
                                            Water Level
                                        </Header.Content>
                                    </Table.Cell>
                                    <Table.Cell>
                                        <Header.Content>
                                            {this.state.show ? this.state.completeDetail.waterLevel : null}
                                        </Header.Content>
                                    </Table.Cell>
                                </Table.Row>
                                <Table.Row>
                                    <Table.Cell>
                                        <Header.Content>
                                            Fuel Level
                                        </Header.Content>
                                    </Table.Cell>
                                    <Table.Cell>
                                        <Header.Content>
                                            {this.state.show ? this.state.completeDetail.fuelLevel : null}
                                        </Header.Content>
                                    </Table.Cell>
                                </Table.Row>
                                <Table.Row>
                                    <Table.Cell>
                                        <Header.Content>
                                            Special Message
                                        </Header.Content>
                                    </Table.Cell>
                                    <Table.Cell>
                                        <Header.Content>
                                            {this.state.show ? this.state.completeDetail.specialMessage : null}
                                        </Header.Content>
                                    </Table.Cell>
                                </Table.Row>
                            </Table.Body>
                        </Table>
                    ) :  (
                        <ProfileCard
                            avatar={avatar}
                            title={this.state.username}
                        />
                    )
                }
            </ItemGrid>
            <ItemGrid xs={12} sm={4} md={4}>
                {
                    this.state.station !== 0 ? (
                        <Table basic='very' celled collapsing>
                            <Table.Header>
                                <Table.Row>
                                    <Table.HeaderCell>Train Id</Table.HeaderCell>
                                    <Table.HeaderCell></Table.HeaderCell>
                                </Table.Row>
                            </Table.Header>
                            <Table.Body>
                                {
                                    this.state.trainTable.map((value, index) => {
                                        return (
                                            <Table.Row key={index}>
                                                <Table.Cell>
                                                    <Header.Content>
                                                        {value}
                                                    </Header.Content>
                                                </Table.Cell>
                                                <Table.Cell>
                                                    <Header.Content>
                                                        <Button basic onClick={() => this.fetchInputDetails(value)}>View Status</Button>
                                                    </Header.Content>
                                                </Table.Cell>
                                            </Table.Row>
                                        )
                                    })
                                }
                            </Table.Body>
                        </Table>
                    ) : (
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
                            footer={<Button color="purple" basic onClick={() => this.fetchInputDetails(this.state.trainID)}>Submit</Button>}
                        />
                    )
                }
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
                                          Time to reach next station {value.time} hr
                                      </TimelineEvent>
                                  )
                              }else {
                                  return (
                                      <TimelineEvent title={value.stationDetail.stationName}
                                                     icon={<i className="material-icons md-18">location_on</i>}
                                                     key={index}
                                      >
                                          Next Station will come after  |     {value.distanceFromNextStation} km
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
