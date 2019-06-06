const colors = require('colors/safe');

module.exports = async function () {
    console.log(colors.blue('KGrid CLI v'+this.config.version+'\n'))
}
