/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Promise } from 'es6-promise';
import 'isomorphic-fetch';
import { Race, Gender, webAPI } from 'camelot-unchained';
type CSEError = webAPI.Errors.CSEError;

import { fetchJSON } from '../../lib/fetchHelpers';

export interface AttributeOffsetInfo {
  race: Race;
  gender: Gender;
  attributeOffsets: any;
}

const FETCH_ATTRIBUTE_OFFSETS = 'cu-character-creation/attribute-offsets/FETCH_ATTRIBUTE_OFFSETS';
const FETCH_ATTRIBUTE_OFFSETS_SUCCESS = 'cu-character-creation/attribute-offsets/FETCH_ATTRIBUTE_OFFSETS_SUCCESS';
const FETCH_ATTRIBUTE_OFFSETS_FAILED = 'cu-character-creation/attribute-offsets/FETCH_ATTRIBUTE_OFFSETS_FAILED';

const RESET = 'cu-character-creation/attribute-offsets/RESET';

export function resetAttributeOffsets() {
  return {
    type: RESET,
  };
}

export function requestAttributeOffsets() {
  return {
    type: FETCH_ATTRIBUTE_OFFSETS,
  };
}

export function fetchAttributeOffsetsSuccess(offsets: AttributeOffsetInfo[]) {
  return {
    type: FETCH_ATTRIBUTE_OFFSETS_SUCCESS,
    offsets,
    receivedAt: Date.now(),
  };
}

export function fetchAttributeOffsetsFailed(error: CSEError) {
  return {
    type: FETCH_ATTRIBUTE_OFFSETS_FAILED,
    error: error.Message,
  };
}

export function fetchAttributeOffsets(shard: number = 1) {
  return (dispatch: (action: any) => any) => {
    dispatch(requestAttributeOffsets());
    return webAPI.GameDataAPI.getAttributeOffsetsV1(shard)
      .then((value) => {
        dispatch(value.ok
                  ? fetchAttributeOffsetsSuccess(value.data)
                  : fetchAttributeOffsetsFailed(value.error));
      });
  };
}

export interface AttributeOffsetsState {
  isFetching?: boolean;
  lastUpdated?: Date;
  offsets?: AttributeOffsetInfo[];
  error?: string;
}

const initialState: AttributeOffsetsState = {
  isFetching: false,
  lastUpdated: <Date>null,
  offsets: [],
  error: null,
};

export default function reducer(state: AttributeOffsetsState = initialState, action: any = {}) {
  switch (action.type) {
    case RESET: return initialState;
    case FETCH_ATTRIBUTE_OFFSETS:
      return Object.assign({}, state, {
        isFetching: true,
      });
    case FETCH_ATTRIBUTE_OFFSETS_SUCCESS:
      return Object.assign({}, state, {
        isFetching: false,
        lastUpdated: action.receivedAt,
        offsets: action.offsets,
      });
    case FETCH_ATTRIBUTE_OFFSETS_FAILED:
      return Object.assign({}, state, {
        isFetching: false,
        error: action.error,
      });
    default: return state;
  }
}
