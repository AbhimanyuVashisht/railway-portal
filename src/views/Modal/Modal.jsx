import React from 'react';
import { Modal, Form, Button, Checkbox } from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';
let axios = require('axios');
let axiosConfig = require('config/Axios/axios');
export default class LoginModal extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            userEmail: '',
            password: '',
            checked: false
        };
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleCheckboxChange = this.handleCheckboxChange.bind(this);
    }

    handleChange(e){
        let target = e.target;
        if(target.type === 'email'){
            this.setState({
                userEmail: target.value
            })
        }else if(target.type === 'password') {
            this.setState({
                password: target.value
            })
        }
    }

    handleCheckboxChange(){
        this.setState({
            checked: !this.state.checked
        })
    }

    handleSubmit(e){
        e.preventDefault();
        axiosConfig.headers['x-origin'] = this.state.checked ? '2' : '1';
        axios.post('/auths/login', {email: this.state.userEmail, password: this.state.password}, axiosConfig)
            .then((response) => {
                response = response.data;
                if(!response.error){
                    if(response.data.user.roleId !== 2 && this.state.checked){
                        alert('You are not a admin');
                    }else {
                        let user = {};
                        user.name = response.data.user.name;
                        user.role = response.data.user.roleId;
                        user.station = response.data.user.stationPosted;
                        sessionStorage.setItem('user', JSON.stringify(user));
                        sessionStorage.setItem('x-auth', response.data.session.token);
                        this.props.handleLogin();
                    }
                }
            })
            .catch((err) => console.log(err));
    }

    render(){
        let styles = {
            marginTop: '50px',
            height: "220px"
        };
        return (
            <Modal  dimmer='blurring' open={this.props.isModalOpen} size="fullscreen" style={styles}>
                <Modal.Content >
                    <Form onSubmit={ this.handleSubmit } size='large'>
                        <Form.Field>
                            <label><h4>Email Address</h4></label>
                            <input type="email" placeholder="Email Address" onChange={this.handleChange} required/>
                        </Form.Field>
                        <Form.Field>
                            <label><h4>Password</h4></label>
                            <input type="password" placeholder="Password" onChange={this.handleChange} required/>
                        </Form.Field>
                        <Form.Field>
                            <Checkbox label='Station Master' onChange={this.handleCheckboxChange} defaultChecked={this.state.checked}/>
                        </Form.Field>
                        <Button type='submit' color="green" size='small'><h5>Log In</h5></Button>
                    </Form>
                </Modal.Content>
            </Modal>
        );
    }
}