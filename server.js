const http = require('http');
const dgram = require('dgram');

const hostname = '127.0.0.1';
const port = 3000;

const server = http.createServer((req, res) => {
	res.statusCode = 200;
	res.setHeader('Access-Control-Allow-Origin', 'http://127.0.0.1:4000');
	res.setHeader('Content-Type', 'application/json');
	getData()
		.then(function (rawData) {
			return processData(rawData);
		})
		.then(function (processedData) {
			res.end(JSON.stringify(processedData));
		})
		.catch(function (err) {
			console.log(err);
		});
});

server.listen(port, hostname, () => {
	console.log(`Server running at http://${hostname}:${port}/`);
});

function getData() {
	return new Promise(function (resolve, reject) {
		const client = dgram.createSocket('udp4');
		client.on('message', function (message) {
			client.close();
			const data = JSON.parse(message.toString());
			resolve(data);
		});
		client.on('error', function (err) {
			reject(err);
		});
		client.send('data', 3001, '127.0.0.1');
	});
}

function lineSmoothing(arr) {
	return arr.reduce((sum, x) => sum + x, 0) / arr.length;
}

let queue = [];
let last;

function processData(data) {
	return new Promise(function (resolve) {
		queue.push(data);
		while (queue.length > 3) {
			queue.shift();
		}
		const lat = lineSmoothing(queue.map((l) => l.lat));
		const lng = lineSmoothing(queue.map((l) => l.lng));
		const l2 = {lat, lng};
		const l1 = last || l2;
		const bearing = Math.atan2(l1.lat - l2.lat, l1.lng - l2.lng);
		last = l2;
		resolve({
			lat,
			lng,
			low: data.battery <= 10,
			bearing
		});
	});
}
