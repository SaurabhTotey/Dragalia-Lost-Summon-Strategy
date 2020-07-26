/**
 * Expected value calculation code
 * For explanations, see https://github.com/SaurabhTotey/Dragalia-Lost-Summon-Strategy/blob/master/Strategy.ipynb
 * This file is meant to be used as a web worker
 */

// Utility functions
const productOfRange = (start, stop) => [...Array(stop - start + 1).keys()].reduce((product, value) => product * (value + start), 1);
const nCr = (n, r) => {
	const biggerR = Math.max(r, n - r);
	return productOfRange(biggerR + 1, n) / productOfRange(1, n - biggerR);
};
const tenChooseTable = [...Array(11).keys()].map(i => nCr(10, i));

// Expected value function
function E(n, r, s, l, p, q, lookupTable = {}) {
	const key = `${n},${r},${l}`;
	if (key in lookupTable) {
		return lookupTable[key];
	}

	if (n === 0) {
		return 0;
	} else if (n === 1) {
		return r;
	}

	const failureProbability = 1 - r;
	let expectedValue;

	if (l < 10 * s || n < 10) {
		let rateOnFailure = r;
		if ((l + 1) % 10 === 0) {
			rateOnFailure += q;
		}
		expectedValue = r * (1 + E(n - 1, p, s, 0, p, q, lookupTable)) +
			failureProbability * E(n - 1, rateOnFailure, s, l + 1, p, q, lookupTable);
	} else {
		const expectedValueAfterSuccess = E(n - 10, p, s, 0, p, q, lookupTable);
		expectedValue = Math.pow(failureProbability, 10) * E(n - 10, r + q, s, l, p, q, lookupTable) +
			[...Array(10).keys()].map(i => tenChooseTable[i + 1] * Math.pow(r, i + 1) * Math.pow(failureProbability, 10 - i - 1) * (i + 1 + expectedValueAfterSuccess)).reduce((total, current) => total  + current, 0);
	}

	lookupTable[key] = expectedValue;
	return expectedValue;
}

/**
 * Handle requests to run calculations
 */
self.onmessage = async message => {
	const numberSummons = message.data.numberSummons;
	const baseRate = message.data.baseRate;
	const pityIncrease = message.data.pityIncrease;

	const calculations = [...Array(Math.floor(numberSummons / 10) + 1).keys()].map(async strategy => E(numberSummons, baseRate, strategy, 0, baseRate, pityIncrease));
	self.postMessage({ expectedValues: await Promise.all(calculations) });
};
