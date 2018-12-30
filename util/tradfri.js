const tradfriClient = require('node-tradfri-client');
const AccessoryTypes = tradfriClient.AccessoryTypes,
  Accessory = tradfriClient.Accessory;
const keys = require('lodash/keys');
const pick = require('lodash/pick');

const securityCode = 'fuWczqlFOaf7hBra';

// manually map names to lights
const lightMapping = {
  '65553': 'Bedroom',
  '65554': 'Living Room',
  '65555': 'Dining Room',
  '65556': 'Kitchen',
  '65557': 'Entry Way'
};

var config = {};

let Tradfri = (module.exports = {});

Tradfri.lightbulbs = {};

Tradfri.tradfriInit = async () => {
  // discover gateway
  const tradfriGateway = await tradfriClient.discoverGateway();

  // create client
  let tradfri = new tradfriClient.TradfriClient(tradfriGateway.addresses[0]);

  // authenticate
  try {
    let resp = await tradfri.authenticate(securityCode);
    config = resp;
  } catch (e) {
    console.log(e);
  }

  // connect
  try {
    await tradfri.connect(
      config.identity,
      config.psk
    );
  } catch (e) {
    console.log(e);
  }

  console.log('Done Tradfri init');

  tradfri
    .on('device updated', device => {
      if (device.type === AccessoryTypes.lightbulb) {
        Tradfri.lightbulbs[device.instanceId] = device;
        // console.log(device.instanceId, device.lightList[0].onOff);
      }
    })
    .on('device removed', instanceId => {
      console.log(`Removed Device: ${instanceId}`);
    })
    .observeDevices();
};

Tradfri.toggleLight = async (lightId, globalOn) => {
  let light;
  try {
    if (lightId === 'global') {
      keys(Tradfri.lightbulbs).forEach(async l => {
        light = Tradfri.lightbulbs[l].lightList[0];
        // if not matching global status
        if (light.onOff != globalOn) await light.toggle();
      });
    } else {
      light = Tradfri.lightbulbs[lightId].lightList[0];
      await light.toggle();
      light.onOff = !light.onOff;
    }

    return light;
  } catch (err) {
    console.log(err);
  }
};

Tradfri.setBrightness = async (lightId, brightness) => {
  let light;
  try {
    light = Tradfri.lightbulbs[lightId].lightList[0];
    await light.setBrightness(brightness);
    light.dimmer = brightness;

    console.log(light);
    return light;
  } catch (err) {
    console.log(err);
  }
};

Tradfri.getLight = async lightId => {
  let lightRef = Tradfri.lightbulbs[lightId];

  return {
    instanceId: lightId,
    name: lightMapping[lightId],
    alive: lightRef.alive,
    ...pick(lightRef.lightList[0], [
      'onOff',
      'dimmer',
      'color',
      'colorTemperature',
      'colorX',
      'colorY',
      'transitionTime'
    ])
  };
};
