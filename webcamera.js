var bodyParser = require('body-parser')

module.exports = function(RED) {

    function CameraNode (config) {
        RED.nodes.createNode(this, config);
        var node = this;
        var requestSize = '50mb';

        RED.httpAdmin.post('/node-red-contrib-webcamera/:id', bodyParser.raw({ type: '*/*', limit: requestSize }), function(req,res) {
            var node = RED.nodes.getNode(req.params.id)
            var payload = {payload: req.body};
            if (req.query.topic) {
                payload['topic'] = req.query.topic
            }

            if (node != null) {
                try {
                    node.receive(payload)
                    node.status({})
                    res.sendStatus(200)
                } catch(err) {
                    node.status({fill:'red', shape:'dot', text:'upload failed'});
                    res.sendStatus(500)
                    node.error(RED._("upload-camera.failed", { error: err.toString() }))
                }
            } else {
                res.status(404).send("no node found")
            }
        });

        this.on('input', function (msg) {
            if(msg.payload !== '') {
                node.send(msg)
            }
        });
    }
    
    RED.nodes.registerType('webcamera', CameraNode)
};
