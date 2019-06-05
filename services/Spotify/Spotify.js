import SpotifyAuth from './SpotifyAuth';

export default class Spotify {

  static async getRecommendationsByTracks(seed_tracks, limit = 10) {
    const sp = await SpotifyAuth.getValidSPObj();
    return await sp.getRecommendations({
      seed_tracks, limit
    });
  }

}
