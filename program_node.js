const fs = require('fs');
const readline = require('node:readline');


const INPUT_FILE = 'measurements_1B.txt';
const OUTPUT_FILE = 'output-file.txt';


async function processLineByLine(filePath) {
	const fileStream = fs.createReadStream(filePath);
	const rl = readline.createInterface({
		input: fileStream,
		crlfDelay: Infinity, // Handle both \n and \r\n as newlines
	});

	let data, temperature;
	const stations = {};
	let numberOfLines = 0;

	for await (const line of rl) {
		data = line.split(';')
		temperature = parseFloat(data[1]);
		if (!stations[data[0]]) {
			stations[data[0]] = {
				min: temperature,
				max: temperature,
			};
		} else {
			if (temperature < stations[data[0]].min) stations[data[0]].min = temperature;
			if (temperature > stations[data[0]].max) stations[data[0]].max = temperature;
		};
		numberOfLines++;
	};

	return {stations, numberOfLines};
};


async function main() {
	const {stations, numberOfLines} = await processLineByLine(INPUT_FILE);
	let stationsLength = Object.keys(stations).length;

	console.log('Lines in file:', numberOfLines);
	console.log('Unique stations:', stationsLength);

	const writableStream = fs.createWriteStream(OUTPUT_FILE);
	writableStream.write('{');

	let mean, station;
	let counter = 0;
	for (const [key, value] of Object.entries(stations)) {
		counter++;
		if (value.max === value.min) {
			mean = value.min;
		} else {
			mean = (value.max - value.min) / 2;
		};
		if (counter !== stationsLength) {
			writableStream.write(`${key}=${value.min}/${mean.toFixed(1)}/${value.max}, `);
		} else {
			writableStream.write(`${key}=${value.min}/${mean.toFixed(1)}/${value.max}`);
		};
	};

	writableStream.write('}');
	writableStream.end();
};


main();




