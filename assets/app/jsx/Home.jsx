import React, {Component} from 'react';
import dataFetch from './DataFetch';
import {notifyError} from '../Common/common';
import Swal from 'sweetalert2';

const style = {
    container: {
        textAlign: 'center'
    },
    title: {
        fontWeight: 'lighter',
        fontSize: '30px'
    }
};

let socket;

class Home extends Component {
    constructor(props) {
        super(props);
        this.state = {
            liveAuctions: []
        };
    }

    componentWillMount() {
        this.getLiveAuctions();
    }

    getLiveAuctions() {
        let user = JSON.parse(sessionStorage.getItem('user'));
        if (user == null || user.role != 'User') {
            window.location.href = '/login';
        } else {
            dataFetch('/liveAuctions', {})
                .then(response => {
                    if (response.status_code == 200 && response.message != null && response.message != []) {
                        this.setState({
                            liveAuctions: response.message
                        });
                    }
                })
                .catch(err => {
                    notifyError(err.response);
                });
        }
    }
    joinAuction = auction => {
        if (auction.access_type === 'private') {
            Swal.fire({
                title: 'Password',
                input: 'text',
                inputAttributes: {
                    autocapitalize: 'off'
                },
                showCancelButton: true,
                confirmButtonText: 'Join',
                showLoaderOnConfirm: true,
                preConfirm: password => {
                    let data = {password, auction};
                    dataFetch('/authorizeAuction', data)
                        .then(data => {
                            if (data.message.verified) {
                                this.props.history.push('/auction/' + auction.auction_url);
                            } else {
                                Swal.fire({
                                    icon: 'error',
                                    title: 'Oops...',
                                    text: 'Incorrect Password'
                                });
                            }
                        })
                        .catch(err => {
                            Swal.fire({
                                icon: 'error',
                                title: 'Oops...',
                                text: err
                            });
                        });
                },
                allowOutsideClick: () => !Swal.isLoading()
            });
        } else {
            this.props.history.push('/auction/' + auction.auction_url);
        }
    };

    render() {
        return (
            <div>
                <div style={style.container}>
                    <div style={style.title}>Welcome to Auctoins:</div>
                    <p>List of live auctions:</p>
                    {this.state.liveAuctions.length == 0 ? (
                        <p>No live auctions found...</p>
                    ) : (
                        this.state.liveAuctions.map(auction => {
                            return (
                                <div>
                                    <span onClick={() => this.joinAuction(auction)}>{auction.auction_url}</span>
                                    <br />
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        );
    }
}

export default Home;
