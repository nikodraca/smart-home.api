const Tradfri = require('../util/tradfri');
const mapKeys = require('lodash/mapKeys');
const pick = require('lodash/pick');

// manually map names to lights
const lightMapping = {
  '65553': 'Bedroom',
  '65554': 'Living Room',
  '65555': 'Dining Room',
  '65556': 'Kitchen',
  '65557': 'Entry Way'
};

// global on or off
let globalOn = false;

const routes = [
  {
    path: '/lights/{lightId}',
    method: 'POST',
    handler: async (req, h) => {
      let action = req.payload.action;
      let lightId = req.params.lightId;

      if (action === 'toggle') {
        if (lightId == 'global') {
          globalOn = !globalOn;
        }
        return await Tradfri.toggleLight(lightId, globalOn);
      }
    }
  },
  {
    path: '/lights',
    method: 'GET',
    handler: async (req, h) => {
      let res = [];

      mapKeys(Tradfri.lightbulbs, (value, key) => {
        // create light structure
        let light = {
          instanceId: key,
          name: lightMapping[key],
          alive: value.alive,
          ...pick(value.lightList[0], [
            'onOff',
            'dimmer',
            'color',
            'colorTemperature',
            'colorX',
            'colorY',
            'transitionTime'
          ])
        };

        // check global status
        if (light.onOff) globalOn = true;

        // append to results
        res.push(light);
      });

      // append global
      res.push({
        instanceId: 'global',
        name: 'Global',
        alive: true,
        onOff: globalOn
      });

      return res;
    }
  },
  {
    path: '/lights/{lightId}',
    method: 'GET',
    handler: async (req, h) => {
      let lightId = req.params.lightId;
      return await Tradfri.getLight(lightId);
    }
  },
  {
    path: '/lights/health',
    method: 'GET',
    handler: async (req, h) => {
      try {
        return { health: true };
      } catch (err) {
        return err;
      }
    }
  }
];

module.exports = routes;
