const fetch = require('node-fetch');
const { computePrice } = require('../utils/pricing');
const Part = require('../models/part.Model');

async function getDistanceAndPrice(req, res) {
  const { partId, toLat, toLon } = req.query;

  if (!partId || !toLat || !toLon) {
    return res
      .status(400)
      .json({ error: 'Missing partId or destination coords' });
  }

  const part = await Part.findById(partId).populate('user');
  if (!part) {
    return res.status(404).json({ error: 'Part not found' });
  }

  const seller = part.user;
  if (!seller || !seller.location || !seller.location.coordinates || seller.location.coordinates.length < 2) {
    return res.status(400).json({ error: 'Seller coordinates not found' });
  }


  const [fromLon, fromLat] = seller.location.coordinates;

  const url = `http://router.project-osrm.org/route/v1/driving/${fromLon},${fromLat};${toLon},${toLat}?overview=false`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.code === 'Ok' && data.routes.length > 0) {
      const route = data.routes[0];
      const distanceKm = route.distance / 1000;
      const durationMin = route.duration / 60;

      const price = computePrice(distanceKm);

      return res.json({
        distanceKm: Number(distanceKm.toFixed(2)),
        durationMin: Number(durationMin.toFixed(1)),
        price: Number(price.toFixed(2)),
        currency: 'SYP',
        sellerCoords: { lon: fromLon, lat: fromLat }
      });
    } else {
      return res.status(500).json({ error: 'No route found' });
    }
  } catch (e) {
    res
      .status(500)
      .json({ error: 'Failed to fetch from OSRM', details: e.message });
  }
}

module.exports = { getDistanceAndPrice };
