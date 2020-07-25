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
 * TODO: actual calculation code
 */


/**
 * TODO: actually useful stuff
 */
