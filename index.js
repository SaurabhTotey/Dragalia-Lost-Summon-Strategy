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

// Updates the wyrmite cost display
const numberSummonsInput = document.getElementById("numberOfSummons");
const wyrmiteCostOutput = document.getElementById("wyrmiteCost");
const updateWyrmiteCost = () => { wyrmiteCostOutput.innerText = `${parseInt(numberSummonsInput.value) * 120}`; };
numberSummonsInput.onchange = updateWyrmiteCost;
updateWyrmiteCost();

/**
 * Handles managing the parameters and calculations and updating the page with the relevant information
 */

const summaryParagraph = document.getElementById("summary");
const pityIncreaseInput = document.getElementById("pityIncrease");
const plot = document.getElementById("plot");

// Set up a worker that will run the calculations in the background
let worker;

function runCalculations() {
	// Clear everything up to either start or restart the worker
	summaryParagraph.innerText = "Loading...";
	plot.innerHTML = '';
	worker && worker.terminate();
	worker = new Worker("./ExpectedValueCalculator.js");

	// Define what happens when the worker sends over the finished calculations
	worker.onmessage = message => {
		const expectedValues = message.data.expectedValues;
		const bestStrategy = expectedValues.reduce((indexOfMax, value, i) => value > expectedValues[indexOfMax] ? i : indexOfMax, 0);
		summaryParagraph.innerText = `The best strategy for ${numberSummons} summons is to perform ${bestStrategy * 10} single summons before only doing tenfold summons.`
			+ ` Once a 5-star unit has been obtained, restart from the beginning of the strategy, even if the 5-star unit was obtained with single summons.`
			+ ` With this strategy, you can expect around ${expectedValues[bestStrategy].toFixed(4)} 5-star units on average.`;
		//TODO: plot
	};

	// Pull relevant parameters from form
	const numberSummons = parseInt(numberSummonsInput.value);
	const baseRate = Number(summonRateTypeSelector.options[summonRateTypeSelector.selectedIndex].value);
	const pityIncrease = Number(pityIncreaseInput.value);

	// Tells the worker to start the calculations
	worker.postMessage({ numberSummons: numberSummons, baseRate: baseRate, pityIncrease: pityIncrease });
}
runCalculations();
