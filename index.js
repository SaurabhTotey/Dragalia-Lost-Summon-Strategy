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

		// Summary text
		summaryParagraph.innerText = `The best strategy for ${numberSummons} summons is to perform ${bestStrategy * 10} single summons before only doing tenfold summons.`
			+ ` Once a 5-star unit has been obtained, restart from the beginning of the strategy, even if the 5-star unit was obtained with single summons.`
			+ ` With this strategy, you can expect around ${expectedValues[bestStrategy].toFixed(4)} 5-star units on average.`;

		// Makes a scatter plot and remakes it every time the window size changes
		const makePlot = () => {
			plot.innerHTML = '';

			const width = Math.floor(window.innerWidth * 0.8);
			const height = Math.floor(Math.min(window.innerHeight * 0.8, width));
			const margins = { left: Math.max(75, Math.floor(width / 10)), right: Math.floor(width / 10),  top: Math.floor(height / 10), bottom: Math.max(75, Math.floor(height / 10)) }

			const svg = d3.select("#plot")
				.append("svg")
					.attr("width", width).attr("height", height)
				.append("g")
					.attr("transform", `translate(${margins.left}, ${margins.top})`);
			const xAxis = d3.scaleLinear().domain([-0.5, expectedValues.length - 0.5]).range([0, width - margins.left - margins.right]);
			const yAxis = d3.scaleLinear().domain([Math.min(...expectedValues) - 0.02, expectedValues[bestStrategy] + 0.02]).range([height - margins.top - margins.bottom, 0]);
			svg.append("g").attr("transform", `translate(0, ${height - margins.top - margins.bottom})`).call(d3.axisBottom(xAxis));
			svg.append("g").call(d3.axisLeft(yAxis));

			svg.append("g").selectAll("dot")
				.data(expectedValues.map((expectedValue, i) => { return { strategy: i, expectedValue: expectedValue }; }))
				.enter()
				.append("circle")
					.attr("cx", d => xAxis(d.strategy))
					.attr("cy", d => yAxis(d.expectedValue))
					.attr("r", 5);

			svg.append("text")
				.attr("transform", `translate(${(width - margins.left - margins.right) / 2}, ${height * 0.85})`)
				.style("text-anchor", "middle")
				.text("Strategy");
			svg.append("text")
				.attr("transform", `rotate(-90) translate(${-(height - margins.top - margins.bottom) / 2}, ${-margins.left / 2})`)
				.style("text-anchor", "middle")
				.text("Expected Value");
			svg.append("text")
				.attr("transform", `translate(${(width - margins.left - margins.right) / 2}, ${0})`)
				.style("text-anchor", "middle")
				.text("Expected Value vs. Strategy")
		};
		window.onresize = makePlot;
		makePlot();
	};

	// Pull relevant parameters from form
	const numberSummons = parseInt(numberSummonsInput.value);
	const baseRate = Number(summonRateTypeSelector.options[summonRateTypeSelector.selectedIndex].value);
	const pityIncrease = Number(pityIncreaseInput.value);

	// Tells the worker to start the calculations
	worker.postMessage({ numberSummons: numberSummons, baseRate: baseRate, pityIncrease: pityIncrease });

	//TODO: maybe animate loading text?
}
runCalculations();
