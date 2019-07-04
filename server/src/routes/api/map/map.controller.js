const googleMaps = require(`@google/maps`);
const util = require('util');
const config = require('../../../config')

const googleMapsClient = googleMaps.createClient({
  key: config.PLACES_API_KEY,
});

exports.search = async(req, res) => {
  const googlePlaces = util.promisify(googleMapsClient.places);
  placequery = req.body.place.trim();
  try {
    const response = await googlePlaces({
      query: placequery,
      language: 'ko',
    });
    res.json(response.json.results);
  } catch (error) {
    console.error(error);
    next(error);
  }
}
