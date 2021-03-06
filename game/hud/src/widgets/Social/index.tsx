/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 * @Author: JB (jb@codecorsair.com)
 * @Date: 2017-01-16 12:55:46
 * @Last Modified by: Andrew L. Jackson (jacksonal300@gmail.com)
 * @Last Modified time: 2017-04-06 11:01:03
 */

import * as React from 'react';
import { createStore, applyMiddleware, compose } from 'redux';
import { Provider} from 'react-redux';
import { client, events, hasClientAPI, jsKeyCodes } from 'camelot-unchained';
import SocialMain from './components/SocialMain';
import reducer, { store } from './services/session/reducer';


export interface SocialContainerProps {
  containerClass?: string;
}

export interface SocialContainerState {
  visible : boolean;
}

class SocialContainer extends React.Component<SocialContainerProps, SocialContainerState> {

  private initialized = false;
  private mainRef: any = null;

  constructor(props : SocialContainerProps) {
    super(props);
    this.state = {
      visible: false,
    };
  }

  public render() {
    return this.state.visible
      ? (
        <Provider store={store}>
          <SocialMain ref={r => this.mainRef = r} {...(this.props as any)} />
        </Provider>
      )
      : null;
  }
  
  public componentDidMount() {
    if (!this.initialized) {
      this.initialized = true;
    }

    events.on('hudnav--navigate', (name : string) => {
      if (name === 'social') {
        if (this.state.visible) {
          this.hide();
        } else {
          this.show();
          if (this.mainRef !== null) this.mainRef.refresh();
        }
      }
    });

    window.addEventListener('keydown', this.onKeyDown);
  }

  public componentWillUnmount() {
    events.off('hudnav--navigate');
    window.removeEventListener('keydown', this.onKeyDown);
  }

  private onKeyDown = (e : KeyboardEvent) => {
    if (e.which === jsKeyCodes.ESC && this.state.visible) {
      client.ReleaseInputOwnership();
      this.hide();
    }
  }

  private show = () => {
    if (typeof client.RequestInputOwnership === 'function') 
      client.RequestInputOwnership();
    this.setState({visible: true});
  }

  private hide = () => {
    if (typeof client.ReleaseInputOwnership === 'function') 
      client.ReleaseInputOwnership();
    this.setState({visible: false});
  }
}

export default SocialContainer;
