import React from 'react';
import {View, ScrollView, Text, ActivityIndicator, StyleSheet, StatusBar} from 'react-native';
import * as firebase from 'firebase';
import SpotifyAuth from '../services/Spotify/SpotifyAuth';
import {NavigationEvents} from "react-navigation";
import Track from '../components/Tracks/Track';
import Colors from '../constants/Colors';
import {Font} from 'expo';

export default class StatsScreen extends React.Component {
  static navigationOptions = {
    header: null,
  };

  state = {
    tracks: [],
    loading: false,
    fontLoaded: false,
  };

  async componentDidMount() {
    await Font.loadAsync({
      'ProximaNova': require('../assets/fonts/ProximaNovaBold.otf'),
    });
    this.setState({fontLoaded: true});
  }

  async getTracks() {
    this.setState({ tracks: [], loading: true });

    const db = firebase.firestore();
    const sp = await SpotifyAuth.getValidSPObj();
    const user = await SpotifyAuth.getCurrentUser();

    db.collection('ratings')
      .where('user_id', '==', user.id)
      .get()
      .then(querySnapshot => {
        querySnapshot.forEach(async doc => {
          const data = doc.data();
          if (data.like) {
            const track = await sp.getTrack(data.track_id);
            let tracks = this.state.tracks;
            tracks.push(track);
            this.setState({tracks});
          }
        });

        this.setState({ loading: false });
      });
  }

  tracks() {
    return this.state.tracks.map(function(track, i){
      return(
        <Track track={track} key={i} />
      );
    });
  }

  render() {
    return(
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        <NavigationEvents
          onDidFocus={this.getTracks.bind(this)}
        />
        <View style={styles.loading}>
          <ActivityIndicator
            animating={this.state.loading}
            size="large"
            color="#ffffff"
          />
        </View>
        {
          this.state.fontLoaded ? (
            <Text style={styles.title}>Liked tracks</Text>
          ) : null
        }
        <ScrollView>
          {this.tracks()}
        </ScrollView>
      </View>
    )
  }

}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.tintColor,
    padding: 30,
    flex: 1,
  },
  title: {
    fontFamily: 'ProximaNova',
    fontSize: 28,
    color: 'white',
    marginBottom: 50,
    marginTop: 50,
  },
  loading: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center'
  }
});
