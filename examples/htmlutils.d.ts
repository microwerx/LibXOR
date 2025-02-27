/// <reference path="../LibXOR.d.ts" />
/**
 * Creates a row div with a left and right column. It expects CSS class row, column, left, and right.
 * @param {string} leftContent
 * @param {string} rightContent
 */
declare function createRow(leftContent?: string, rightContent?: string, extraContent?: string): HTMLDivElement;
declare function adjustRangeValue(id: string, stepValue: number): void;
/**
 * createRangeRow creates a row with a range control
 * @param {HTMLElement} parent The element that should be appended to
 * @param {string} id The name of the range variable
 * @param {number} curValue The current value of the range
 * @param {number} minValue The minimum value of the range
 * @param {number} maxValue The maximum value of the range
 * @param {number} stepValue The step of the range control (default 1)
 * @returns {HTMLElement} The created HTMLElement div
 */
declare function createRangeRow(parent: HTMLElement, id: string, curValue: number, minValue: number, maxValue: number, stepValue?: number, isvector?: boolean): void;
declare function updateRuleRow(id: string, offset: number): void;
/**
 * createRuleRow adds a row that uses a text box to enter a number and displays it as a binary number.
 * @param parent
 * @param id
 * @param caption
 * @param callback
 */
declare function createRuleRow(parent: HTMLElement, id: string, caption: string, callback: () => void): void;
declare function updateLifeRow(id: string, num: number): void;
/**
 * createRuleRow adds a row that uses a text box to enter a number and displays it as a binary number.
 * @param parent
 * @param id
 * @param caption
 * @param callback
 */
declare function createLifeRow(parent: HTMLElement, id: string, caption: string, callback: () => void): void;
/**
 * createRowButton adds a button to the control list
 * @param {HTMLElement} parent The parent HTMLElement
 * @param {string} caption The caption of the button
 * @param {string} id The name of the button's id
 * @param {function} callback A callback function if this gets clicked
 */
declare function createButtonRow(parent: HTMLElement, id: string, caption: string, callback: () => void): void;
/**
 * createCheckButton adds a button to the control list
 * @param {HTMLElement} parent The parent HTMLElement
 * @param {string} id The name of the button's id
 * @param {boolean} checked Is it checked or not
 */
declare function createCheckRow(parent: HTMLElement, id: string, checked: boolean): void;
/**
 * createTextRow adds a button to the control list
 * @param {HTMLElement} parent The parent HTMLElement
 * @param {string} id The name of the button's id
 * @param {string} value The initial value of the string
 */
declare function createTextRow(parent: HTMLElement, id: string, value: string): void;
/**
 * createTextRow adds a button to the control list
 * @param {HTMLElement} parent The parent HTMLElement
 * @param {string} id The name of the label's id
 * @param {string} value The initial value of the string
 */
declare function createLabelRow(parent: HTMLElement, id: string, value: string): void;
/**
 * createDivRow adds a row to the control list
 * @param {HTMLElement} parent The parent HTMLElement
 * @param {string} id The name of the row's id
 */
declare function createDivRow(parent: HTMLElement, id: string): void;
/**
 * setDivRowContents
 * @param {string} id
 * @param {string} content
 */
declare function setDivRowContents(id: string, content: string): void;
declare function setDivRowButtonCaption(id: string, caption: string): void;
/**
 * setDivRowValue
 * @param id the id of the input element
 * @param content the new value the control should have
 */
declare function setDivRowValue(id: string, content: string): void;
/**
 * setDivLabelValue
 * @param id the id of the input element
 * @param content the new value the control should have
 */
declare function setDivLabelValue(id: string, content: string): void;
/**
 * getRangeValue returns the number of a range control
 * @param {string} id
 * @returns the value of the range control or 0
 */
declare function getRangeValue(id: string): number;
/**
 * Returns if control is checked or not
 * @param {string} id
 * @returns {boolean}
 */
declare function getCheckValue(id: string): boolean;
/**
 * getRangeVector3
 * @param {string} id The id of the range controls ending with 1, 2, 3. Example: id="sky", we get "sky1", "sky2", etc.
 * @returns {Vector3} A Vector3 with the values from controls id1, id2, and id3.
 */
declare function getRangeVector3(id: string): Vector3;
/**
 * setIdToHtml
 * @param {string} id
 * @param {string} html
 */
declare function setIdToHtml(id: string, html: string): void;
declare function uiRangeRow(id: string, curValue: number, minValue: number, maxValue: number, stepValue?: number, isvector?: boolean, controlsElementName?: string): number;
declare function uiCheckRow(id: string, curValue: boolean, controlsElementName?: string): number | boolean;
declare function uiLabelRow(id: string, label: string, controlsElementName?: string): void;
/**
 * Creates a row with an integer rule.
 * @param id The id of the control that stores the text value.
 * @param curValue An integer that represents the initial rule.
 * @param controlsElementName The id of the container that contains all the UI elements.
 * @returns The integer value of the current rule.
 */
declare function uiRuleRow(id: string, curValue: number, controlsElementName?: string): number;
declare function createComboRow(parent: HTMLElement, id: string, values: string[], presetCallback: (index: number) => void): void;
declare function removeControls(): void;
declare function collapseLog(): void;
