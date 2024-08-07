const fs = require("fs");
const path = require("path");
const os = require("os");
const { Worker, isMainThread, parentPort, workerData } = require("worker_threads");

const CONFIG = {
	fibTest: {
		iterations: 40, // Number of Fibonacci calculations; increasing will make the test longer and more CPU-intensive
		depth: 30, // Depth of Fibonacci calculation; higher values increase CPU load exponentially
		runs: 5, // Number of times to run the test for averaging; more runs increase consistency but take more time
	},
	primeTest: {
		limit: 100000, // Upper limit for prime number calculation; higher values increase test duration
		runs: 5, // Number of times to run the test for averaging; more runs increase consistency but take more time
	},
	memoryTest: {
		size: 100 * 1024 * 1024, // Size of the memory buffer to test in bytes; larger sizes increase memory load
		runs: 5, // Number of times to run the test for averaging; more runs increase consistency but take more time
	},
};

// Function to calculate Fibonacci numbers (single-threaded)
function fibonacci(n) {
	if (n <= 1) return n;
	return fibonacci(n - 1) + fibonacci(n - 2);
}

// Function to calculate prime numbers up to a certain limit (multi-threaded)
function calculatePrimes(limit) {
	let primes = [];
	for (let num = 2; num <= limit; num++) {
		let isPrime = true;
		for (let i = 2; i <= Math.sqrt(num); i++) {
			if (num % i === 0) {
				isPrime = false;
				break;
			}
		}
		if (isPrime) primes.push(num);
	}
	return primes;
}

// Memory access speed test
function memorySpeedTest(size) {
	const buffer = Buffer.alloc(size);
	const start = process.hrtime.bigint();
	for (let i = 0; i < size; i++) {
		buffer[i] = (buffer[i] + 1) % 256;
	}
	const end = process.hrtime.bigint();
	return Number(end - start) / 1e6; // Convert to milliseconds
}

// Function to run single-threaded Fibonacci benchmark
function runFibonacciBenchmark(iterations, depth) {
	const start = process.hrtime.bigint();
	for (let i = 0; i < iterations; i++) {
		fibonacci(depth);
	}
	const end = process.hrtime.bigint();
	return Number(end - start) / 1e9; // Convert to seconds
}

// Function to run multi-threaded prime number benchmark
function runPrimeBenchmark(limit, numThreads) {
	return new Promise((resolve) => {
		const start = process.hrtime.bigint();
		let primes = [];
		let completed = 0;
		for (let i = 0; i < numThreads; i++) {
			const worker = new Worker(__filename, { workerData: { limit: limit / numThreads } });
			worker.on("message", (data) => {
				primes = primes.concat(data);
				completed++;
				if (completed === numThreads) {
					const end = process.hrtime.bigint();
					resolve(Number(end - start) / 1e9); // Convert to seconds
				}
			});
		}
	});
}

// Function to display a loading spinner
function displaySpinner(text) {
	const spinnerFrames = ["|", "/", "-", "\\"];
	let i = 0;
	const interval = setInterval(() => {
		process.stdout.write(`\r${text} ${spinnerFrames[i]}`);
		i = (i + 1) % spinnerFrames.length;
	}, 100);
	return interval;
}

// Function to run the benchmark
async function runBenchmark() {
	const fibConfig = CONFIG.fibTest;
	const primeConfig = CONFIG.primeTest;
	const memoryConfig = CONFIG.memoryTest;

	console.log("Benchmark Configuration:");
	console.log(JSON.stringify(CONFIG, null, 2));

	console.log("Running single-threaded Fibonacci benchmark...");
	const fibSpinner = displaySpinner("Fibonacci benchmark in progress...");
	let fibDurations = [];
	for (let i = 0; i < fibConfig.runs; i++) {
		const startTime = process.hrtime();
		fibDurations.push(runFibonacciBenchmark(fibConfig.iterations, fibConfig.depth));
		const endTime = process.hrtime(startTime);
		console.log(`\nFibonacci benchmark run ${i + 1} completed in ${endTime[0]}s ${endTime[1] / 1e6}ms`);
	}
	clearInterval(fibSpinner);
	console.log("Fibonacci benchmark completed.");
	const fibDuration = fibDurations.reduce((a, b) => a + b) / fibConfig.runs;
	const fibScore = (fibConfig.iterations / fibDuration).toFixed(2);

	console.log("Running multi-threaded prime number benchmark...");
	const primeSpinner = displaySpinner("Prime number benchmark in progress...");
	const numThreads = os.cpus().length;
	let primeDurations = [];
	for (let i = 0; i < primeConfig.runs; i++) {
		const startTime = process.hrtime();
		primeDurations.push(await runPrimeBenchmark(primeConfig.limit, numThreads));
		const endTime = process.hrtime(startTime);
		console.log(`\nPrime number benchmark run ${i + 1} completed in ${endTime[0]}s ${endTime[1] / 1e6}ms`);
	}
	clearInterval(primeSpinner);
	console.log("Prime number benchmark completed.");
	const primeDuration = primeDurations.reduce((a, b) => a + b) / primeConfig.runs;
	const primeScore = (primeConfig.limit / primeDuration).toFixed(2);

	console.log("Running memory access speed test...");
	const memSpinner = displaySpinner("Memory access speed test in progress...");
	let memDurations = [];
	for (let i = 0; i < memoryConfig.runs; i++) {
		const startTime = process.hrtime();
		memDurations.push(memorySpeedTest(memoryConfig.size));
		const endTime = process.hrtime(startTime);
		console.log(`\nMemory access speed test run ${i + 1} completed in ${endTime[0]}s ${endTime[1] / 1e6}ms`);
	}
	clearInterval(memSpinner);
	console.log("Memory access speed test completed.");
	const memDuration = memDurations.reduce((a, b) => a + b) / memoryConfig.runs;
	const memScore = (memoryConfig.size / memDuration).toFixed(2);

	saveResults(fibScore, primeScore, memScore, fibDuration, primeDuration, memDuration);
}

function saveResults(fibScore, primeScore, memScore, fibDuration, primeDuration, memDuration) {
	const desktopPath = path.join(os.homedir(), "Desktop");
	const fileName = `cpu-benchmark-${Date.now()}.txt`;
	const filePath = path.join(desktopPath, fileName);

	const result = `Benchmark Results:
Single-threaded Fibonacci:
Time Taken: ${fibDuration.toFixed(2)} seconds
CPU Score: ${fibScore}

Multi-threaded Prime Number:
Time Taken: ${primeDuration.toFixed(2)} seconds
CPU Score: ${primeScore}

Memory Access Speed:
Time Taken: ${memDuration.toFixed(2)} milliseconds
Memory Score: ${memScore}`;

	fs.writeFileSync(filePath, result);
	console.log(`Results saved to ${filePath}`);
}

// Worker thread execution
if (isMainThread) {
	runBenchmark();
} else {
	const primes = calculatePrimes(workerData.limit);
	parentPort.postMessage(primes);
}
