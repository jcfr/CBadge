module.exports = function(){
    return 'Basic '+new Buffer('CBadge:'+process.env.CBADGE_PASSWORD);
}