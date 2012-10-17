var fs = require('fs'),
    path = require('path'),
    async = require('async'),
    finder = require('./finder');


var getLayout = function() {

};

module.exports = {
    getConfig: function(root){
        async.senis(function(){
            finder.findWebroot(root, function(result) {

            });
        });
    },
    getContent: function(path){

    }
};