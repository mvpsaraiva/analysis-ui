import React from 'react'
import {useSelector} from 'react-redux'
import pointInPolygon from '@turf/boolean-point-in-polygon'
import {point} from '@turf/helpers'

import selectHopStops from 'lib/selectors/hop-stops'

import DrawPolygon from './draw-polygon'

/**
 * Select stops using a polygon select
 */
export default function HopSelectPolygon(p) {
  const hopStops = useSelector(selectHopStops)

  function onPolygon(polygon) {
    const newHops = hopStops
      .filter(
        (hop) =>
          pointInPolygon(point([hop[0].stop_lon, hop[0].stop_lat]), polygon) &&
          pointInPolygon(point([hop[1].stop_lon, hop[1].stop_lat]), polygon)
      )
      .map((hop) => [hop[0].stop_id, hop[1].stop_id])

    switch (p.action) {
      case 'add':
        return p.update([...new Set([...p.currentHops, ...newHops])])
      case 'new':
        return p.update(newHops)
      case 'remove':
        // TODO ensure logic is correct
        return p.update(
          p.currentHops.filter(
            (c) =>
              newHops.findIndex((n) => c[0] === n[0] && c[1] === n[1]) !== -1
          )
        )
    }
  }

  return <DrawPolygon activateOnMount onPolygon={onPolygon} />
}
