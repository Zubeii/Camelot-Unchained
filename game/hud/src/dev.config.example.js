/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 * @Author: JB (jb@codecorsair.com)
 * @Date: 2017-01-26 11:50:04
 * @Last Modified by: JB (jb@codecorsair.com)
 * @Last Modified time: 2017-01-26 12:10:20
 */

/* USAGE:
 *
 * create a copy of this file and name it dev.config.js, then add
 * your information. .config.js files are ignored by git.
 * 
 * window.cuOverrides will override any data on the cuAPI / client
 * object from camelot-unchained library.
 * 
 * Use this file to save your api tokens (login token) character
 * details and whatnot.
 * 
 */

(function () {
  window.cuOverrides = {
    loginToken: 'developer',
    characterID: 'ABCDEFG',
    apiHost: 'https://api.camelotunchained.com',
    apiVersion: 1,
    shardID: 1,
    debug: true
  };
})();
