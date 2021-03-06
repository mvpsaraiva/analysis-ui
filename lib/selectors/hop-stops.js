import {createSelector} from 'reselect'

import selectActiveModification from './active-modification'
import selectModificationFeed from './modification-feed'

export default createSelector(
  selectActiveModification,
  selectModificationFeed,
  (m, feed) => {
    // get all hops from all (selected) patterns
    const route = feed.routes.find((r) => r.route_id === m.routes[0])
    if (!route) return []
    let patterns = route.patterns

    if (m.trips !== null) {
      patterns = patterns.filter(
        (p) => p.trips.findIndex((t) => m.trips.includes(t.trip_id)) > -1
      )
    }

    const hopsForPattern = patterns.map((p) =>
      p.stops.map((stop, index, array) =>
        index < array.length - 1
          ? [stop.stop_id, array[index + 1].stop_id]
          : null
      )
    )

    // smoosh hops from all patterns together
    const candidateHops = []
      .concat(...hopsForPattern)
      .filter((hop) => hop != null)

    return candidateHops.map((hop) => [
      feed.stopsById[hop[0]],
      feed.stopsById[hop[1]]
    ])
  }
)
