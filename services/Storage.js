import {AsyncStorage} from 'react-native';

export default class Storage {

  /**
   * Save data on the device using a key and value.
   * 
   * @param key
   * @param value
   *
   * @returns {Promise<void>}
   */
  static async setUserData(key, value) {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    }
    catch (e) {
      // Error.
    }
  }

  /**
   * Get saved data from device.
   * 
   * @param key
   *
   * @returns {Promise<*>}
   */
  static async getUserData(key) {
    try {
      const value = await AsyncStorage.getItem(key);
      if (value !== null) {
        return JSON.parse(value);
      }
    } catch (error) {
      return null;
    }
  }

  /**
   * Takes an array of keys, and removes those items from device storage.
   *
   * @param keys
   */
  static unsetUserData(keys) {
    keys.forEach(key => {
      AsyncStorage.removeItem(key);
    });
  }

}
