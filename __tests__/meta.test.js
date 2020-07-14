const { defineAddEventListener, defineRemoveEventListener } = require("../src/utils/ubiquitous-props.js");

// bypass Jest-specific behaviors incurred by way of higher-order functions
/* Mocks */

const mockObject = {
    0: "item"
};
const mockHandler = () => console.log("fired");

const mockHandlers = {
    mockevent: [
        mockHandler,
        "mockHandler"
    ]
};

/* Assertions */

describe("enforce coverage on higher-order functions", () => {

    it("should throw an exception when provided an invalid handler", () => {

        defineAddEventListener(mockObject, mockHandlers);
        defineRemoveEventListener(mockObject, mockHandlers);
        expect(() => mockObject.addEventListener("mockevent", "mockHandler")).toThrow("Error: Invalid handler.");
        expect(() => mockObject.removeEventListener("mockevent", "mockHandler")).toThrow("Error: Invalid handler.");

    });

});
