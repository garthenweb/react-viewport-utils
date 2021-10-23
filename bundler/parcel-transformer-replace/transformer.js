const { Transformer } = require('@parcel/plugin');
const pkg = require('../../package.json');

module.exports.default = new Transformer({
  async transform({ asset }) {
    const code = await asset.getCode();
    // TODO consider adding a source map. Currently, we put the variable length to the exact same size to not make the code jump, but this is a bit odd and error prone...
    const result = code.replace(/_VERS_/gm, pkg.version);

    asset.setCode(result);
    return [asset];
  },
});
