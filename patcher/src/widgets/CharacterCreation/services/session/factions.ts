/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Promise } from 'es6-promise';
import 'isomorphic-fetch';

import { fetchJSON } from '../../lib/fetchHelpers';
import { webAPI } from 'camelot-unchained';
type CSEError = webAPI.Errors.CSEError;

export interface FactionInfo {
  id: number;
  name: string;
  description: string;
  shortName: string;
}

const FETCH_FACTIONS = 'cu-character-creation/factions/FETCH_FACTIONS';
const FETCH_FACTIONS_SUCCESS = 'cu-character-creation/factions/FETCH_FACTIONS_SUCCESS';
const FETCH_FACTIONS_FAILED = 'cu-character-creation/factions/FETCH_FACTIONS_FAILED';
const SELECT_FACTION = 'cu-character-creation/factions/SELECT_FACTION';
const RESET_FACTION = 'cu-character-creation/factions/RESET_FACTION';

export function resetFaction() {
  return {
    type: RESET_FACTION,
  };
}

export function requestFactions() {
  return {
    type: FETCH_FACTIONS,
  };
}

export function fetchFactionsSuccess(factions: FactionInfo[]) {
  return {
    type: FETCH_FACTIONS_SUCCESS,
    factions,
    receivedAt: Date.now(),
  };
}

export function fetchFactionsFailed(error: CSEError) {
  return {
    type: FETCH_FACTIONS_FAILED,
    error: error.Message,
  };
}

export function selectFaction(selected: FactionInfo) {
  return {
    type: SELECT_FACTION,
    selected,
  };
}

export function fetchFactions(shard: number = 1) {
  return (dispatch: (action: any) => any) => {
    dispatch(requestFactions());
    return webAPI.GameDataAPI.getFactionInfoV1()
      .then((value) => {
        dispatch(value.ok ? fetchFactionsSuccess(value.data) : fetchFactionsFailed(value.error));
      });
  };
}

export interface FactionsState {
  isFetching?: boolean;
  lastUpdated?: Date;
  factions?: FactionInfo[];
  selected?: FactionInfo;
  error?: string;
}

const initialState: FactionsState = {
  isFetching: false,
  lastUpdated: <Date>null,
  factions: [],
  selected: null,
  error: null,
};

export default function reducer(state: FactionsState = initialState, action: any = {}) {
  switch (action.type) {
    case RESET_FACTION: return initialState;
    case FETCH_FACTIONS:
      return Object.assign({}, state, {
        isFetching: true,
      });
    case FETCH_FACTIONS_SUCCESS:
      return Object.assign({}, state, {
        isFetching: false,
        lastUpdated: action.receivedAt,
        factions: action.factions,
      });
    case FETCH_FACTIONS_FAILED:
      return Object.assign({}, state, {
        isFetching: false,
        error: action.error,
      });
    case SELECT_FACTION:
      return Object.assign({}, state, {
        selected: action.selected,
      });
    default: return state;
  }
}
