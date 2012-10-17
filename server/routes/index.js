
/*
 * GET home page.
 */
var webx = require('../../lib/webx/webx');

exports.index = function(req, res){
  res.render('index', { title: 'Express' });
};

exports.find = function(req, res){
    var params = req.method == 'GET' ? req.query : req.body;
    webx.getConfig(params.root, function(result) {
        res.send(result);
    });
};