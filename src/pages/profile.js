import React, { Component } from "react";
import { PersonalTweets } from "../helper/tweets";
import {
	ListFollowing,
	ListFollowers,
	User,
	updateUser
} from "../helper/users";
import { NavBar } from "../nav/navbar";

let u = "";
let nfollowers = 0;
let nfollowing = 0;

// `ChkFollowing` chks logged user follows the current user and returns *Follow/Unfollow* as required
const ChkFollowing = (props) => {
	const followingList = localStorage.ufollowing;
	if (followingList.indexOf(props.uname) === -1) {
		return (<button value="Follow" id="followbutton" onClick={props.followUser} >Follow</button>);
	}
	return (<button value="Unfollow" id="unfollowbutton" onClick={props.unfollowUser}>Unfollow</button>);
};

// `Profile` component renders profile page of the app
export default class Profile extends Component {
	// Initialize state with number of followers=0, number of following=0
	constructor(props) {
		super(props);
		this.logOut = this.logOut.bind(this);
		this.goLocal = this.goLocal.bind(this);
		this.followUser = this.followUser.bind(this);
		this.unfollowUser = this.unfollowUser.bind(this);
		this.onSearch = this.onSearch.bind(this);
		this.goGlobalFeed = this.goGlobalFeed.bind(this);
		this.goPresonalFeed = this.goPresonalFeed.bind(this);
		this.onDataFollowers = this.onDataFollowers.bind(this);
		this.onDataFollowing = this.onDataFollowing.bind(this);
		this.goProfile = this.goProfile.bind(this);
		this.state = {
			nfollowers: 0,
			nfollowing: 0
		};
	}

	// Function called when Search is pressed
	onSearch(event) {
		event.preventDefault();
		const t = event.target[0].value;


		this.props.router.push(`search/${t}`);
	}

	// Function called when the `ListFollowers` component gets data
	onDataFollowers(response, err) {
		let result = null;
		if (err) {
			return result;
		} else if (response) {
			let combineData = response.currentData;
			if (response.mode === "historic") {
				combineData = response.currentData.concat(response.newData);
			} else if (response.mode === "streaming") {
				combineData.unshift(response.newData);
			}
			if (combineData.length !== 0) {
				const following = combineData[0]._source.followers;
				nfollowing = following.length;
				if (following !== undefined) {
					result = following.map(markerData => (<User name={markerData} />));
				}
			}
			this.setState({
				nfollowers,
				nfollowing
			});
		}
		return result;
	}

	// Function called when the `ListFollowing` component gets data
	onDataFollowing(response, err) {
		let result = null;
		if (err) {
			return result;
		} else if (response) {
			let combineData = response.currentData;
			if (response.mode === "historic") {
				combineData = response.currentData.concat(response.newData);
			} else if (response.mode === "streaming") {
				combineData.unshift(response.newData);
			}
			let followers = [];
			if (combineData.length !== 0) {
				followers = combineData[0]._source.following;
			}
			nfollowers = followers.length;
			if (followers !== undefined) {
				result = followers.map(markerData => (<User name={markerData} />));
			}
		}
		this.setState({
			nfollowers,
			nfollowing
		});
		return result;
	}

	// check if the user is followed by logged user or not

	// on Follow pressed
	followUser(event) {
		event.preventDefault();
		updateUser(true, this.props.params.uname);
	}

	// on Unfollow pressed
	unfollowUser(event) {
		event.preventDefault();
		updateUser(false, this.props.params.uname);
	}

	// on press profile go to present logged user's profile page
	goLocal(event) {
		event.preventDefault();
		u = localStorage.user;
		this.props.router.replace(`/${u}`);
	}

	// on logout pressed this function is called
	logOut(event) {
		event.preventDefault();
		this.props.router.push("/");
		delete localStorage.user;
	}

	// on `Global` button pessed, function called to switch to logged user dashboard with showing Global tweets
	goGlobalFeed(event) {
		event.preventDefault();
		const loggedUser = localStorage.user;
		this.props.router.replace({ pathname: `/${loggedUser}`, query: { show: 1 } });
	}

	// on `PersonalFeed` button pressed, function called to switch to logged user dashboard with showing Personal Tweets
	goPresonalFeed(event) {
		event.preventDefault();
		const loggedUser = localStorage.user;
		this.props.router.replace({ pathname: `/${loggedUser}`, query: { show: 0 } });
	}

	goProfile(event) {
		event.preventDefault();
		const loggedUser = localStorage.user;
		this.props.router.replace(`/profile/${loggedUser}`);
	}


	// renders the profile component
	render() {
		const msgStyles = {
			maxWidth: 800,
			marginLeft: "10%",
			marginTop: "5%"
		};

		// `pflg` set to `1` i.e flage for navbar for profile page
		const pflg = 1;
		// `NavBar` component to render navigation bar for profile page.<br />
		// `ListFollowers`, `ListFollowing` components to show list of followers and following respectively.<br /><br />
		// The `userinfo` element shows user image, username and number of following,followers. <br />
		// It also gives the option to *follow* or *unfollow* the user.<br />
		// It contains `PersonalTweets` actuator component that receives tweets from `UserProfileTweet` DataController sensor in `NavBar`.
		return (
			<div className="row" >
				<NavBar
					user={this.props.params.uname}
					logOut={this.logOut}
					pflg={pflg}
					onSearch={this.onSearch}
					goGlobalFeed={this.goGlobalFeed}
					goPresonalFeed={this.goPresonalFeed}
					goProfile={this.goProfile}
				/>

				<div className="col m2 s6 offset-s1 offset-m1" style={{ marginTop: "3%" }}>
					<ListFollowers
						user={this.props.params.uname}
						onDataFollowers={this.onDataFollowers}
					/>
					<ListFollowing
						user={this.props.params.uname}
						onDataFollowing={this.onDataFollowing}
					/>
				</div>

				<div id="userinfo" className="col s12 m7 l91" style={msgStyles}>
					<div style={{ float: "left", width: "20%" }}>
						<img style={{ height: "15%", margin: "15% 10% 15% 15%" }} src="../user@2x.png" alt="UserImage" />
					</div>
					<div style={{ float: "left", width: "80%" }} >
						<div style={{ float: "left" }}>
							<h3 style={{ textAlign: "center" }}>{this.props.params.uname}</h3>
						</div>
						<div style={{ width: "100%", float: "left" }} key={this.state}>
							{(localStorage.user !== this.props.params.uname) ? (
								<div className="col s2" >
									<ChkFollowing
										uname={this.props.params.uname}
										followUser={this.followUser}
										unfollowUser={this.unfollowUser}
									/>
								</div>) : (
									<div />)}
							<div id="followstats" key={this.props.params.uname}>
								<button className="col s4 btn disabled" style={{ backgroundColor: "blue", marginLeft: "2%" }}>Followers {this.state.nfollowing}</button>
								<button className="col s4 btn disabled" style={{ backgroundColor: "blue" }}>Following {this.state.nfollowers}</button>
							</div>
						</div>
					</div>
					<div className="col s8">
						<PersonalTweets
							user={this.props.params.uname}
							reactOn={["UserProfileTweet"]}
						/>
					</div>
				</div>
			</div>
		);
	}
	}
