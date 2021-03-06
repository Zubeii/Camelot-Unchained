/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import 'es6-promise';
import 'isomorphic-fetch';
import * as React from 'react';
import { createStore, applyMiddleware } from 'redux';
import { connect, Provider } from 'react-redux';
import thunk from 'redux-thunk';

import { events, Gender, Archetype, Faction, Race, webAPI, client } from 'camelot-unchained';

import FactionSelect from './components/FactionSelect';
import PlayerClassSelect from './components/PlayerClassSelect';
import RaceSelect from './components/RaceSelect';
import AttributesSelect from './components/AttributesSelect';
import BanesAndBoonsContainer from './components/BanesAndBoonsContainer';

// tslint:disable-next-line
const Animate =  require('react-animate.css');

import reducer from './services/session/reducer';
import { RacesState, fetchRaces, selectRace, RaceInfo, resetRace } from './services/session/races';
import { FactionsState, fetchFactions, selectFaction, FactionInfo, resetFaction } from './services/session/factions';
import {
  PlayerClassesState,
  fetchPlayerClasses,
  selectPlayerClass,
  PlayerClassInfo,
  resetClass,
} from './services/session/playerClasses';
import {
  AttributesState,
  fetchAttributes,
  allocateAttributePoint,
  AttributeInfo,
  attributeType,
  resetAttributes,
} from './services/session/attributes';
import {
  AttributeOffsetsState,
  fetchAttributeOffsets,
  AttributeOffsetInfo,
  resetAttributeOffsets,
} from './services/session/attributeOffsets';
import { CharacterState, createCharacter, CharacterCreationModel, resetCharacter } from './services/session/character';
import { selectGender, resetGender } from './services/session/genders';
import {
  BanesAndBoonsState,
  resetBanesAndBoons,
} from './services/session/banesAndBoons';

export { CharacterCreationModel } from './services/session/character';

declare const Materialize: any;

const store = createStore(reducer, applyMiddleware(thunk as any));

function select(state: any): any {
  return {
    racesState: state.races,
    playerClassesState: state.playerClasses,
    factionsState: state.factions,
    attributesState: state.attributes,
    attributeOffsetsState: state.attributeOffsets,
    gender: state.gender,
    characterState: state.character,
    banesAndBoonsState: state.banesAndBoons,
  };
}

export enum pages {
  FACTION_SELECT,
  RACE_SELECT,
  CLASS_SELECT,
  ATTRIBUTES,
  BANES_AND_BOONS,
}

export interface CharacterCreationProps {
  apiKey: string;
  apiHost: string;
  apiVersion: number;
  shard: number;
  created: (character: CharacterCreationModel) => void;
  dispatch?: (action: any) => void;
  racesState?: RacesState;
  playerClassesState?: PlayerClassesState;
  factionsState?: FactionsState;
  attributesState?: AttributesState;
  attributeOffsetsState?: AttributeOffsetsState;
  gender?: Gender;
  characterState?: CharacterState;
  banesAndBoonsState: BanesAndBoonsState;
}

declare const toastr: any;

class CharacterCreation extends React.Component<CharacterCreationProps, any> {

  constructor(props: any) {
    super(props);
    this.state = { page: pages.FACTION_SELECT };
  }

  public render() {
    let content: any = null;
    let next: any = null;
    let back: any = null;
    let name: any = null;
    switch (this.state.page) {
      case pages.FACTION_SELECT:
        content = (
          <FactionSelect factions={this.props.factionsState.factions}
            selectedFaction={this.props.factionsState.selected}
            selectFaction={this.factionSelect} />
        );
        next = (
          <a className='cu-btn right'
            onClick={this.factionNext}
            disabled={this.state.page === pages.ATTRIBUTES} >Next</a>
        );
        break;
      case pages.RACE_SELECT:
        content = (
          <RaceSelect races={this.props.racesState.races}
            selectedRace={this.props.racesState.selected}
            selectRace={this.raceSelect}
            selectedGender={this.props.gender}
            selectGender={(selected: Gender) => this.props.dispatch(selectGender(selected)) }
            selectedFaction={this.props.factionsState.selected} />
        );
        back = (
          <a className='cu-btn left'
            onClick={this.previousPage}
            disabled={this.state.page === pages.FACTION_SELECT} >Back</a>
        );
        next = (
          <a className='cu-btn right'
            onClick={this.raceNext}
            disabled={this.state.page === pages.ATTRIBUTES} >Next</a>
        );
        name = (
          <div className='cu-character-creation__name'>
            <input type='text' ref='name-input' placeholder='Enter A Name Here'/>
          </div>
        );
        break;
      case pages.CLASS_SELECT:
        content = (
          <PlayerClassSelect classes={this.props.playerClassesState.playerClasses}
            selectedClass={this.props.playerClassesState.selected}
            selectClass={this.classSelect}
            selectedFaction={this.props.factionsState.selected} />
        );
        back = (
          <a className='cu-btn left'
            onClick={this.previousPage}
            disabled={this.state.page === pages.FACTION_SELECT} >Back</a>
        );
        next = (
          <a className='cu-btn right'
            onClick={this.classNext}
            disabled={this.state.page === pages.BANES_AND_BOONS} >Next</a>
        );
        name = (
          <div className='cu-character-creation__name'>
            <input type='text' ref='name-input' placeholder='Character Name'/>
          </div>
        );
        break;
      case pages.ATTRIBUTES:
        content = (
          <AttributesSelect attributes={this.props.attributesState.attributes}
            attributeOffsets={this.props.attributeOffsetsState.offsets}
            selectedGender={this.props.gender}
            selectedRace={this.props.racesState.selected.id}
            allocatePoint={(name: string, value: number) => this.props.dispatch(allocateAttributePoint(name, value)) }
            remainingPoints={this.props.attributesState.maxPoints - this.props.attributesState.pointsAllocated} />
        );
        back = (
          <a className='cu-btn left'
            onClick={this.previousPage}
            disabled={this.state.page === pages.CLASS_SELECT} >Back</a>
        );
        next = (
           <a className='cu-btn right'
              onClick={this.attributesNext}
              disabled={this.state.page === pages.BANES_AND_BOONS}>Next</a>
        );
        name = (
          <div className='cu-character-creation__name'>
            <input type='text' ref='name-input' placeholder='Character Name'/>
          </div>
        );
        break;
      case pages.BANES_AND_BOONS:
        const { dispatch, racesState, factionsState, playerClassesState, banesAndBoonsState } = this.props;
        content = (
          <BanesAndBoonsContainer
            race={racesState}
            faction={factionsState}
            playerClass={playerClassesState}
            banesAndBoons={banesAndBoonsState}
            dispatch={dispatch}
            baneStyles={{}}
            boonStyles={{}}
            styles={{}}
            traitSummaryStyles={{}}
          />
        );
        back = (
          <a className='cu-btn left'
              onClick={this.previousPage}
              disabled={this.state.page === pages.ATTRIBUTES}>Back</a>
        );
        next = (
          <a className={`cu-btn right`} disabled={this.props.characterState.isFetching} onClick={this.create} >Create</a>
        );
        name = (
          <div className='cu-character-creation__name banes-and-boons-screen'>
            <input type='text' ref='name-input' placeholder='Character Name'/>
          </div>
        );
        break;
    }

    return (
      <div className='cu-character-creation'>
        <div className='cu-character-creation__content'>
          {content}
        </div>
        <div className='cu-character-creation__back'>{back}</div>
        {name}
        <div className='cu-character-creation__next'>{next}</div>
      </div>
    );
  }

  public componentWillReceiveProps(nextProps: CharacterCreationProps) {
    if (this.props && nextProps && this.props.shard !== nextProps.shard) this.resetAndInit();
    if (this.props.factionsState !== nextProps.factionsState ||
        this.props.playerClassesState !== nextProps.playerClassesState ||
        this.props.racesState !== nextProps.racesState) {
      this.props.dispatch(resetBanesAndBoons());
    }
  }

  public componentDidMount() {
    this.resetAndInit();
  }

  public componentDidUpdate() {
    if (this.props.characterState.success) {
      this.props.created(this.props.characterState.created);
      this.resetAndInit();
    }
  }

  private create = () => {
    events.fire('play-sound', 'create-character');
    // validate name
    const { banesAndBoonsState } = this.props;
    const modelName = (this.refs['name-input'] as any).value.trim();
    const normalName = modelName.replace(/[^a-zA-Z]/g, '').toLowerCase();
    const sumOfTraitValues = (Object.keys(banesAndBoonsState.addedBoons).length > 0 &&
    Object.keys(banesAndBoonsState.addedBoons).map((id: string) => banesAndBoonsState.traits[id].points)
    .reduce((a, b) => a + b) || 0) + (Object.keys(banesAndBoonsState.addedBanes).length > 0 &&
    Object.keys(banesAndBoonsState.addedBanes).map((id: string) =>
    banesAndBoonsState.traits[id].points * -1).reduce((a, b) => a + b) || 0);
    
    const errors: any = [];
    if (normalName.length < 2 || modelName.length > 20)
      errors.push('A character name must be between 2 and 20 characters in length.');
    if (modelName.search(/^[a-zA-Z]/) === -1)
      errors.push('A character name must begin with a letter.');
    if (modelName.search(/[\-'][\-']/) > -1)
      errors.push('A character name must not contain two or more consecutive hyphens (-) or apostrophes (\').');
    if (modelName.search(/^[a-zA-Z\-']+$/) === -1)
      errors.push('A character name must only contain the letters A-Z, hyphens (-), and apostrophes (\').');
    if (banesAndBoonsState.totalPoints !== 0)
      errors.push('You must equally distribute points into your Boons and Banes');
    if (sumOfTraitValues > banesAndBoonsState.maxPoints) 
      errors.push(`The total points of chosen Banes and Boons, ${sumOfTraitValues}, exceeds the maximum points allowed. 
      Maximum points allowed: ${banesAndBoonsState.maxPoints}`);
    if (sumOfTraitValues < banesAndBoonsState.minPoints) 
      errors.push(
        `The total points of chosen Banes and Boons, ${sumOfTraitValues}, does not meet the minimum points required. 
      Minimum points required: ${banesAndBoonsState.minPoints}`);
    if (this.props.attributesState.maxPoints !== this.props.attributesState.pointsAllocated)
      errors.push(`You must spend all ${this.props.attributesState.maxPoints} points into your character's attributes.
      You have only spent ${this.props.attributesState.pointsAllocated} points.`);
    if (!webAPI.TraitsAPI.getTraitsV1(client.shardID).then(res => res.ok))
      errors.push(
        'We are having technical difficulties. You will not be able to create a character until they have been fixed.',
      );
    if (errors.length > 0) {
      errors.forEach((e: string) => toastr.error(e, 'Oh No!!', {timeOut: 5000}));
    } else {
      const traitIDs = [
        ...Object.keys(banesAndBoonsState.addedBanes),
        ...Object.keys(banesAndBoonsState.addedBoons),
      ];
      // try to create...
      const model: CharacterCreationModel = {
        name: modelName,
        race: this.props.racesState.selected.id,
        gender: this.props.gender,
        faction: this.props.factionsState.selected.id,
        archetype: this.props.playerClassesState.selected.id,
        shardID: this.props.shard,
        attributes: this.props.attributesState.attributes.reduce((acc: any, cur: AttributeInfo) => {
          if (cur.type !== attributeType.PRIMARY) return acc;
          if (typeof acc.name !== 'undefined') {
            const name = acc.name;
            const val = acc.allocatedPoints;
            acc = {};
            acc[name] = val;
          }
          if (typeof acc[cur.name] === 'undefined' || isNaN(acc[cur.name])) {
            acc[cur.name] = cur.allocatedPoints;
          } else {
            acc[cur.name] += cur.allocatedPoints;
          }
          return acc;
        }),
        traitIDs,
      };
      this.props.dispatch(createCharacter(model,
        this.props.apiKey,
        this.props.apiHost,
        this.props.shard,
        this.props.apiVersion));
    }
  }

  private factionSelect = (selected: FactionInfo) => {
    this.props.dispatch(selectFaction(selected));

    const factionRaces = this.props.racesState.races.filter((r: RaceInfo) => r.faction === selected.id);
    const factionClasses = this.props.playerClassesState.playerClasses
      .filter((c: PlayerClassInfo) => c.faction === selected.id);
    this.props.dispatch(selectPlayerClass(factionClasses[0]));
    this.props.dispatch(selectRace(factionRaces[0]));

    // reset race & class if they are not of the selected faction
    if (this.props.racesState.selected && this.props.racesState.selected.faction !== selected.id) {
      this.props.dispatch(selectRace(null));
      this.props.dispatch(selectPlayerClass(null));
    }
    events.fire('play-sound', 'select');
  }

  private factionNext = () => {
    if (this.props.factionsState.selected == null) {
      Materialize.toast('Choose a faction to continue.', 3000);
      return;
    }
    const factionRaces = this.props.racesState.races
      .filter((r: RaceInfo) => r.faction === this.props.factionsState.selected.id);
    const factionClasses = this.props.playerClassesState.playerClasses
      .filter((c: PlayerClassInfo) => c.faction === this.props.factionsState.selected.id);
    this.props.dispatch(selectPlayerClass(factionClasses[0]));
    this.props.dispatch(selectRace(factionRaces[0]));
    this.setState({ page: this.state.page + 1 });
    events.fire('play-sound', 'realm-select');
  }

  private raceSelect = (selected: RaceInfo) => {
    this.props.dispatch(selectRace(selected));
    events.fire('play-sound', 'select');
  }

  private raceNext = () => {
    if (this.props.racesState.selected == null) {
      Materialize.toast('Choose a race to continue.', 3000);
      return;
    }
    if (this.props.gender === 0) {
      Materialize.toast('Choose a gender to continue.', 3000);
      return;
    }
    this.setState({ page: this.state.page + 1 });
    events.fire('play-sound', 'select');
  }

  private classSelect = (selected: PlayerClassInfo) => {
    this.props.dispatch(selectPlayerClass(selected));
    events.fire('play-sound', 'select');
  }

  private classNext = () => {
    if (this.props.playerClassesState.selected == null) {
      Materialize.toast('Choose a class to continue.', 3000);
      return;
    }
    this.setState({ page: this.state.page + 1 });
    events.fire('play-sound', 'select');
  }

  private attributesNext = () => {
    if (this.props.attributesState.pointsAllocated !== this.props.attributesState.maxPoints) {
      toastr.error(`You must spend all ${this.props.attributesState.maxPoints} points into your character's attributes.
      You have only spent ${this.props.attributesState.pointsAllocated} points`, 'Oh No!!!', {timeOut: 5000});
      return;
    }
    this.setState({page: this.state.page + 1});
    events.fire('play-sound', 'select');
  }

  private previousPage = () => {
    this.setState({ page: this.state.page - 1 });
    events.fire('play-sound', 'select');
  }

  private resetAndInit = () => {
    this.props.dispatch(resetFaction());
    this.props.dispatch(resetRace());
    this.props.dispatch(resetGender());
    this.props.dispatch(resetClass());
    this.props.dispatch(resetAttributeOffsets());
    this.props.dispatch(resetAttributes());
    this.props.dispatch(resetCharacter());
    this.props.dispatch(fetchFactions(this.props.shard));
    this.props.dispatch(fetchRaces(this.props.shard));
    this.props.dispatch(fetchPlayerClasses(this.props.apiHost, this.props.shard, this.props.apiVersion));
    this.props.dispatch(fetchAttributes(this.props.shard));
    this.props.dispatch(fetchAttributeOffsets(this.props.shard));
    this.setState({page: pages.FACTION_SELECT});
  }
}

const ConnectedCharacterCreation = connect(select)(CharacterCreation);

export interface ContainerProps {
  apiKey: string;
  apiHost: string;
  apiVersion: number;
  shard: number;
  created: (created: CharacterCreationModel) => void;
}

class Container extends React.Component<ContainerProps, any> {
  public render() {
    return (
      <div id='cu-character-creation'>
        <Provider store={store}>
          <ConnectedCharacterCreation apiKey={this.props.apiKey}
            apiHost={this.props.apiHost}
            apiVersion={this.props.apiVersion}
            shard={this.props.shard}
            created={this.props.created} />
        </Provider>
        <div className='preloader' ></div>
      </div>
    );
  }
}

export default Container;
