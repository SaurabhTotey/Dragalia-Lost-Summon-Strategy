/**
 * Links the custom summon rate fields together
 */

// Updates the value of the custom summonRateType option with what is in the field
const customSummonRateInput = document.getElementById("customSummonRate");
const customSummonRateOption = document.getElementById("customSummonRateOption");
const updateCustomSummonRateOptionValue = () => { customSummonRateOption.value = customSummonRateInput.value; };
customSummonRateInput.onchange = updateCustomSummonRateOptionValue;
updateCustomSummonRateOptionValue();

// Updates the visibility of the custom summon rate input based on whether the user actually wants a custom summon rate
const summonRateTypeSelector = document.getElementById("summonRateType");
const customSummonRateLabel = document.getElementById("customSummonRateLabel");
const updateCustomSummonRateInputVisibility = () => {
	const shouldHide = summonRateTypeSelector.selectedIndex !== 2;
	customSummonRateInput.hidden = shouldHide;
	customSummonRateLabel.hidden = shouldHide;
};
summonRateTypeSelector.onchange = updateCustomSummonRateInputVisibility;
updateCustomSummonRateInputVisibility();

/**
 * Expected value calculation code
 * For explanations, see https://github.com/SaurabhTotey/Dragalia-Lost-Summon-Strategy/blob/master/Strategy.ipynb
 */

const productOfRange = (start, stop) => [...Array(stop - start + 1).keys()].reduce((product, value) => product * (value + start), 1);
const nCr = (n, r) => {
	const biggerR = Math.max(r, n - r);
	return productOfRange(biggerR + 1, n) / productOfRange(1, n - biggerR);
};
const pow = (a, b) => [...Array(b)].reduce(product => product * a, 1);
const tenChooseTable = [...Array(11).keys()].map(i => nCr(10, i));

async function E(n, r, s, l, p, q, lookupTable = {}) {
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
		expectedValue = r * (1 + await E(n - 1, p, s, 0, p, q, lookupTable)) +
			failureProbability * await E(n - 1, rateOnFailure, s, l + 1, p, q, lookupTable);
	} else {
		const expectedValueAfterSuccess = await E(n - 10, p, s, 0, p, q, lookupTable);
		expectedValue = pow(failureProbability, 10) * await E(n - 10, r + q, s, l, p, q, lookupTable) +
			[...Array(10).keys()].map(i => tenChooseTable[i + 1] * pow(r, i + 1) * pow(failureProbability, 10 - i - 1) * (i + 1 + expectedValueAfterSuccess)).reduce((total, current) => total  + current, 0);
	}

	lookupTable[key] = expectedValue;
	return expectedValue;
}

/**
 * Handles managing the parameters and calculations and updating the page with the relevant information
 */
const summaryParagraph = document.getElementById("summary");
const numberSummonsInput = document.getElementById("numberOfSummons");
const pityIncreaseInput = document.getElementById("pityIncrease");

async function refresh() {
	summaryParagraph.innerText = "Loading...";

	const numberSummons = parseInt(numberSummonsInput.value);
	const baseRate = Number(summonRateTypeSelector.options[summonRateTypeSelector.selectedIndex].value);
	const pityIncrease = Number(pityIncreaseInput.value);

	const calculations = [...Array(Math.floor(numberSummons / 10) + 1).keys()].map(strategy => E(numberSummons, baseRate, strategy, 0, baseRate, pityIncrease));
	const expectedValues = await Promise.all(calculations);
	console.log(expectedValues);
}
refresh();
