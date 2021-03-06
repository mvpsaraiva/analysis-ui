import Leaflet from 'leaflet'

const MB_URL = 'https://api.mapbox.com/styles/v1/conveyal'
const MB_TOKEN = process.env.MAPBOX_ACCESS_TOKEN
const MB_STYLE = 'cjwu7oipd0bf41cqqv15huoim' // based off "Light"

/**
 * Allow passing a style to get the full Leaflet url.
 */
export function getTileUrl(style = MB_STYLE) {
  return `${MB_URL}/${style}/tiles/256/{z}/{x}/{y}@2x?access_token=${MB_TOKEN}`
}

/**
 * There were universal settings for Leaflet that made importing it from a local
 * file instead of the library a good idea.
 */
export default Leaflet
