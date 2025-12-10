import '@testing-library/jest-dom';

// Additional global test setup can go here.

// Some axe-core checks call canvas APIs not implemented by jsdom. Provide
// a minimal stub so accessibility checks run in the test environment.
if (typeof HTMLCanvasElement !== 'undefined' && !HTMLCanvasElement.prototype.getContext) {
	// @ts-ignore
	HTMLCanvasElement.prototype.getContext = function () {
		return {
			getImageData: () => ({ data: [] }),
			putImageData: () => {},
			createImageData: () => [],
			getContextAttributes: () => ({}),
			measureText: () => ({ width: 0 }),
		} as any;
	};
}

export {};
