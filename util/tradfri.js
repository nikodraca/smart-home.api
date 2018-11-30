const tradfriClient = require('node-tradfri-client');
const AccessoryTypes = tradfriClient.AccessoryTypes,
  Accessory = tradfriClient.Accessory;

const securityCode = 'fuWczqlFOaf7hBra';
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

Tradfri.toggleLight = async lightId => {
  try {
    let light = Tradfri.lightbulbs[lightId].lightList[0];
    await light.toggle();
  } catch (err) {
    console.log(err);
  }
};
