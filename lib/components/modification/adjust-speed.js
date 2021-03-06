import {faExclamationCircle} from '@fortawesome/free-solid-svg-icons'
import get from 'lodash/get'
import dynamic from 'next/dynamic'
import React from 'react'
import {useSelector} from 'react-redux'

import message from 'lib/message'
import selectModificationFeed from 'lib/selectors/modification-feed'

import {Button, Group} from '../buttons'
import {MAP_STATE_HOP_SELECTION} from '../../constants'
import Icon from '../icon'
import {Group as FormGroup, NumberInput} from '../input'

import SelectFeedRouteAndPatterns from './select-feed-route-and-patterns'

const MapLayer = dynamic(() =>
  import('../modifications-map/adjust-speed-layer')
)

/**
 * Adjust speed on a route
 */
export default function AdjustSpeedComponent(p) {
  const selectedFeed = useSelector(selectModificationFeed)

  function onSelectorChange(value) {
    const {feed, routes, trips} = value
    p.updateAndRetrieveFeedData({feed, routes, trips, hops: null})
  }

  function newSelection() {
    p.setMapState({
      state: MAP_STATE_HOP_SELECTION,
      action: 'new'
    })
  }

  function addToSelection() {
    p.setMapState({
      state: MAP_STATE_HOP_SELECTION,
      action: 'add'
    })
  }

  function removeFromSelection() {
    p.setMapState({
      state: MAP_STATE_HOP_SELECTION,
      action: 'remove'
    })
  }

  function clearSegment() {
    p.update({hops: null})
  }

  /**
   * Set the factor by which we are scaling, or the speed which we are
   * replacing.
   */
  function setScale(e) {
    p.update({scale: e.currentTarget.value})
  }

  return (
    <>
      <MapLayer feed={selectedFeed} modification={p.modification} />

      <SelectFeedRouteAndPatterns
        allowMultipleRoutes
        onChange={onSelectorChange}
        routes={p.modification.routes}
        trips={p.modification.trips}
      />

      {get(p, 'modification.routes.length') === 1 && (
        <FormGroup>
          <label htmlFor='Segment'>Segment</label>
          <Group justified>
            <Button onClick={newSelection}>{message('common.select')}</Button>
            <Button onClick={addToSelection}>{message('common.addTo')}</Button>
            <Button onClick={removeFromSelection}>
              {message('common.removeFrom')}
            </Button>
            <Button onClick={clearSegment}>{message('common.clear')}</Button>
          </Group>
          <div className='alert alert-info' role='alert'>
            <Icon icon={faExclamationCircle} />
            {message('report.adjustSpeed.selectInstructions')}
          </div>
        </FormGroup>
      )}

      <NumberInput
        label={message('report.adjustSpeed.scaleLabel')}
        name={message('report.adjustSpeed.scaleLabel')}
        min={0}
        onChange={setScale}
        step='any'
        value={p.modification.scale}
      />
    </>
  )
}
