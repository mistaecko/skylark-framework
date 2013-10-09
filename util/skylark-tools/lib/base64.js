var fs = require('fs');


function convert(path) {
    var content = fs.readFileSync(path);
    content = new Buffer(content).toString('base64');
    fs.writeFileSync(path + '.base64', content);
}

exports = module.exports = convert;