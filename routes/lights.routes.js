const Tradfri = require('../util/tradfri');

// manually map names to lights
const lightMapping = {
  '65553': 'Bedroom',
  '65554': 'Living Room',
  '65555': 'Dining Room',
  '65556': 'Kitchen',
  '65557': 'Entry Way'
};

const routes = [
  {
    path: '/lights/{lightId}',
    method: 'POST',
    handler: async (req, h) => {
      let action = req.payload.action;
      let lightId = req.params.lightId;

      if (action === 'toggle') {
        Tradfri.toggleLight(lightId);
      }

      return action;
    }
  },
  {
    path: '/lights',
    method: 'GET',
    handler: async (req, h) => {
      return Tradfri.lightbulbs;
    }
  },
  {
    path: '/lights/{lightId}',
    method: 'GET',
    handler: async (req, h) => {
      let lightId = req.params.lightId;
      return Tradfri.lightbulbs[lightId];
    }
  }
];

module.exports = routes;
