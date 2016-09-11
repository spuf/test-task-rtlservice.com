const R = 10;
const O = {
	lat: 10,
	lng: 10,
};
const T = 60;

function generateLocation(time) {
	const ts = time / 1000;
	const dx = (Math.random() - 0.5) * 2;
	const dy = (Math.random() - 0.5) * 2;
	const lat = O.lat + R * Math.cos(ts) + dx;
	const lng = O.lng + R * Math.sin(ts) + dy;
	const battery = 100 * Math.abs(Math.sin(ts / T));
	return {lat, lng, battery};
}

const http = require('http');

const hostname = '127.0.0.1';
const port = 3001;

const dgram = require('dgram');
const server = dgram.createSocket('udp4');

server.on('listening', function () {
	const address = server.address();
	console.log(`UDP server listening on ${address.address}:${address.port}`);
});

server.on('message', function (message, remote) {
	if (message == 'data') {
		const payload = generateLocation(Date.now());
		server.send(JSON.stringify(payload), remote.port, remote.address);
	}
});

server.bind(port, hostname);
