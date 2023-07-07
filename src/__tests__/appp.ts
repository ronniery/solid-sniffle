// Not compatible with ES6 import/export
const mockingoose = require('mockingoose');

export default (model: any, { payload, action }: { payload: any, action: string }) => {
  return mockingoose(model).toReturn(payload, action);
}