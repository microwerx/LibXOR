"use strict";
/* eslint-disable no-unused-vars */
/// <reference path="../LibXOR.d.ts" />
// START HELPFUL HTML5 FUNCTIONS
/**
 * Creates a row div with a left and right column. It expects CSS class row, column, left, and right.
 * @param {string} leftContent
 * @param {string} rightContent
 */
function createRow(leftContent = "", rightContent = "", extraContent = "") {
    let row = document.createElement('div');
    row.className = 'row';
    let left = document.createElement('div');
    left.className = 'column left';
    left.innerHTML = leftContent;
    let right = document.createElement('div');
    right.className = 'column right';
    right.innerHTML = rightContent;
    let extra = document.createElement('div');
    extra.className = 'column extra';
    extra.innerHTML = extraContent;
    row.appendChild(left);
    row.appendChild(right);
    row.appendChild(extra);
    return row;
}
function adjustRangeValue(id, stepValue) {
    const newValue = getRangeValue(id) + stepValue;
    setDivRowValue(id, newValue.toString());
}
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
function createRangeRow(parent, id, curValue, minValue, maxValue, stepValue = 1, isvector = false) {
    let lContent = "<label for='" + id + "'>" + id + "<label>";
    let rContent = "";
    if (!isvector) {
        rContent += "<input type='range' id='" + id + "' value='" + curValue + "' min='" + minValue + "' max='" + maxValue + "' step='" + stepValue + "' />";
        const dec = "adjustRangeValue('" + id + "', -" + stepValue.toString() + ")";
        const inc = "adjustRangeValue('" + id + "', " + stepValue.toString() + ")";
        rContent += "<button class='nudgebtn' onclick=\"" + dec + "\">-</button><button class='nudgebtn' onclick=\"" + inc + "\">+</button>";
    }
    else {
        rContent += "<input type='range' id='" + id + "1' value='" + curValue + "' min='" + minValue + "' max='" + maxValue + "' step='" + stepValue + "' />";
        rContent += "<input type='range' id='" + id + "2' value='" + curValue + "' min='" + minValue + "' max='" + maxValue + "' step='" + stepValue + "' />";
        rContent += "<input type='range' id='" + id + "3' value='" + curValue + "' min='" + minValue + "' max='" + maxValue + "' step='" + stepValue + "' />";
    }
    let eContent = "";
    if (!isvector) {
        eContent += "<label class='labels' id='" + id + "_value'>0</label>";
    }
    let row = createRow(lContent, rContent, eContent);
    row.id = "row" + id;
    row.className = "row";
    parent.appendChild(row);
}
function updateRuleRow(id, offset) {
    let text = document.getElementById(id + '_text');
    let t = parseInt(text === null || text === void 0 ? void 0 : text.value) | 0;
    t += offset;
    t = t & 262143;
    text.value = t.toString();
    let l = document.getElementById(id);
    l.innerText = t.toString();
}
/**
 * createRuleRow adds a row that uses a text box to enter a number and displays it as a binary number.
 * @param parent
 * @param id
 * @param caption
 * @param callback
 */
function createRuleRow(parent, id, caption, callback) {
    let lContent = "<label for='" + id + "'>" + id + "<label>";
    let rContent = "";
    rContent += "<input style='width:8em;' type='text' id='" + id + "_text' value='" + caption + "'></input>";
    const same = "updateRuleRow('" + id + "', 0)";
    const dec = "updateRuleRow('" + id + "', -1)";
    const inc = "updateRuleRow('" + id + "', 1)";
    rContent += "<button class='nudgebtn' onclick=\"" + same + "\">Set</button>";
    rContent += "<button class='nudgebtn' onclick=\"" + dec + "\">-</button>";
    rContent += "<button class='nudgebtn' onclick=\"" + inc + "\">+</button>";
    let eContent = "<label id='" + id + "'>0</label>";
    let row = createRow(lContent, rContent, eContent);
    row.id = "row" + id;
    row.className = "row";
    parent.appendChild(row);
}
function updateLifeRow(id, num) {
}
/**
 * createRuleRow adds a row that uses a text box to enter a number and displays it as a binary number.
 * @param parent
 * @param id
 * @param caption
 * @param callback
 */
function createLifeRow(parent, id, caption, callback) {
    let lContent = "<label for='" + id + "'>" + id + "<label>";
    let rContent = "";
    rContent += "<input style='width:8em;' type='text' id='" + id + "_text' value='" + caption + "'></input>";
    const same = "updateLifeRow('" + id + "', 1)";
    const dec = "updateRuleRow('" + id + "', 2)";
    const inc = "updateRuleRow('" + id + "', 3)";
    rContent += "<button class='nudgebtn' onclick=\"" + same + "\">0</button>";
    rContent += "<button class='nudgebtn' onclick=\"" + dec + "\">1</button>";
    rContent += "<button class='nudgebtn' onclick=\"" + inc + "\">2</button>";
    let eContent = "<label id='" + id + "'>0</label>";
    let row = createRow(lContent, rContent, eContent);
    row.id = "row" + id;
    row.className = "row";
    parent.appendChild(row);
}
/**
 * createRowButton adds a button to the control list
 * @param {HTMLElement} parent The parent HTMLElement
 * @param {string} caption The caption of the button
 * @param {string} id The name of the button's id
 * @param {function} callback A callback function if this gets clicked
 */
function createButtonRow(parent, id, caption, callback) {
    let lContent = "<div class='column left'><label for='" + id + "'>" + id + "<label></div>";
    let rContent = "<div class='column right'>";
    rContent += "<button id='" + id + "'>" + caption + "</button>";
    rContent += "</div><div class='column left'>";
    rContent += "<label id='" + id + "_value'>0</label>";
    rContent += "</div>";
    let row = createRow(lContent, rContent);
    row.id = "row" + id;
    row.className = "row";
    parent.appendChild(row);
    let b = document.getElementById(id);
    if (b) {
        b.onclick = callback;
    }
}
/**
 * createCheckButton adds a button to the control list
 * @param {HTMLElement} parent The parent HTMLElement
 * @param {string} id The name of the button's id
 * @param {boolean} checked Is it checked or not
 */
function createCheckRow(parent, id, checked) {
    let lContent = "<div class='column left'><label for='" + id + "'>" + id + "<label></div>";
    let rContent = "<div class='column right'>";
    let c = checked ? " checked" : "";
    rContent += "<input type='checkbox' id='" + id + "' " + c + "/>";
    rContent += "</div><div class='column left'>";
    rContent += "<label id='" + id + "_value'>0</label>";
    rContent += "</div>";
    let row = createRow(lContent, rContent);
    row.id = "row" + id;
    row.className = "row";
    parent.appendChild(row);
}
/**
 * createTextRow adds a button to the control list
 * @param {HTMLElement} parent The parent HTMLElement
 * @param {string} id The name of the button's id
 * @param {string} value The initial value of the string
 */
function createTextRow(parent, id, value) {
    let lContent = "<div class='column left'><label for='" + id + "'>" + id + "<label></div>";
    let rContent = "<div class='column right'>";
    rContent += "<input type='text' style='width: 8em' id='" + id + " value='" + value + "' />";
    rContent += "</div><div class='column left'>";
    rContent += "<label id='" + id + "_value'>" + value + "</label>";
    rContent += "</div>";
    let row = createRow(lContent, rContent);
    row.id = "row" + id;
    row.className = "row";
    parent.appendChild(row);
}
/**
 * createTextRow adds a button to the control list
 * @param {HTMLElement} parent The parent HTMLElement
 * @param {string} id The name of the label's id
 * @param {string} value The initial value of the string
 */
function createLabelRow(parent, id, value) {
    let lContent = "<div class='column left'><label id='" + id + "'>" + id + "<label></div>";
    let rContent = "<div class='column right'>";
    rContent += "<label id='" + id + "_value'>" + value + "</label>";
    rContent += "</div>";
    let row = createRow(lContent, rContent);
    row.id = "row" + id;
    row.className = "row";
    parent.appendChild(row);
}
/**
 * createDivRow adds a row to the control list
 * @param {HTMLElement} parent The parent HTMLElement
 * @param {string} id The name of the row's id
 */
function createDivRow(parent, id) {
    let lContent = "<div class='column left'><label for='" + id + "'>" + id + "<label></div>";
    let rContent = "<div class='column right' id='" + id + "'>";
    rContent += "</div>";
    let row = createRow(lContent, rContent);
    row.id = "row" + id;
    row.className = "row";
    parent.appendChild(row);
}
/**
 * setDivRowContents
 * @param {string} id
 * @param {string} content
 */
function setDivRowContents(id, content) {
    let e = document.getElementById(id);
    if (!e)
        return;
    e.innerHTML = content;
}
function setDivRowButtonCaption(id, caption) {
    let e = document.getElementById(id);
    if (!e)
        return;
    e.innerHTML = caption;
}
/**
 * setDivRowValue
 * @param id the id of the input element
 * @param content the new value the control should have
 */
function setDivRowValue(id, content) {
    let e = document.getElementById(id);
    if (!e)
        return;
    e.value = content;
    let l = document.getElementById(id + "_value");
    if (l)
        l.innerHTML = e.value.toString();
}
/**
 * setDivLabelValue
 * @param id the id of the input element
 * @param content the new value the control should have
 */
function setDivLabelValue(id, content) {
    let l = document.getElementById(id + "_value");
    if (l)
        l.innerHTML = content;
}
/**
 * getRangeValue returns the number of a range control
 * @param {string} id
 * @returns the value of the range control or 0
 */
function getRangeValue(id) {
    let e = document.getElementById(id);
    if (!e)
        return 0;
    let l = document.getElementById(id + "_value");
    if (l)
        l.innerHTML = e.value.toString();
    return parseFloat(e.value) * 1.0;
}
/**
 * Returns if control is checked or not
 * @param {string} id
 * @returns {boolean}
 */
function getCheckValue(id) {
    let e = document.getElementById(id);
    if (!e)
        return false;
    let l = document.getElementById(id + "_value");
    if (l)
        l.innerHTML = e.value.toString();
    return e.checked;
}
/**
 * getRangeVector3
 * @param {string} id The id of the range controls ending with 1, 2, 3. Example: id="sky", we get "sky1", "sky2", etc.
 * @returns {Vector3} A Vector3 with the values from controls id1, id2, and id3.
 */
function getRangeVector3(id) {
    return Vector3.make(getRangeValue(id + "1"), getRangeValue(id + "2"), getRangeValue(id + "3"));
}
/**
 * setIdToHtml
 * @param {string} id
 * @param {string} html
 */
function setIdToHtml(id, html) {
    let el = document.getElementById(id);
    if (el) {
        el.innerHTML = html;
    }
}
function uiRangeRow(id, curValue, minValue, maxValue, stepValue = 1, isvector = false, controlsElementName = 'controls') {
    let c = document.getElementById(controlsElementName);
    if (!c)
        return curValue;
    let e = document.getElementById(id);
    if (!e) {
        createRangeRow(c, id, curValue, minValue, maxValue, stepValue, isvector);
        return curValue;
    }
    else {
        let l = document.getElementById(id + "_value");
        if (l)
            l.innerHTML = e.value.toString();
        return parseFloat(e.value) * 1.0;
    }
}
function uiCheckRow(id, curValue, controlsElementName = 'controls') {
    let c = document.getElementById(controlsElementName);
    if (!c)
        return curValue;
    let e = document.getElementById(id);
    if (!e) {
        createCheckRow(c, id, curValue);
        return curValue;
    }
    else {
        const pressed = e.checked ? 1 : 0;
        let l = document.getElementById(id + "_value");
        if (l)
            l.innerHTML = pressed.toString();
        return pressed;
    }
}
function uiLabelRow(id, label, controlsElementName = 'controls') {
    let c = document.getElementById(controlsElementName);
    if (!c)
        return;
    let e = document.getElementById(id);
    if (!e) {
        createLabelRow(c, id, label);
    }
    else {
        let l = document.getElementById(id + "_value");
        if (l)
            l.innerHTML = label;
    }
}
/**
 * Creates a row with an integer rule.
 * @param id The id of the control that stores the text value.
 * @param curValue An integer that represents the initial rule.
 * @param controlsElementName The id of the container that contains all the UI elements.
 * @returns The integer value of the current rule.
 */
function uiRuleRow(id, curValue, controlsElementName = 'controls') {
    curValue = curValue | 0;
    let c = document.getElementById(controlsElementName);
    if (!c) {
        return curValue;
    }
    let e = document.getElementById(id);
    if (!e) {
        createRuleRow(c, id, curValue.toString(), () => {
            let text = document.getElementById(id);
            let t = parseInt(text === null || text === void 0 ? void 0 : text.value) | 0;
            t = t & 262143;
            text.value = t.toString();
            // let label = <HTMLLabelElement>document.getElementById(id)
            // label.innerText = t.toString()
        });
        return curValue;
    }
    else {
        let value = parseInt(e.textContent || "");
        // Set the label value.
        let l = document.getElementById(id + "_value");
        if (l) {
            l.innerHTML = value.toString(2);
        }
        return value;
    }
}
function createComboRow(parent, id, values, presetCallback) {
    let e = document.getElementById(id);
    if (e) {
        return;
    }
    let lContent = "<label for='" + id + "'>" + id + "<label>";
    let rContent = "<select id='" + id + "'>";
    for (let i = 0; i < values.length; i++) {
        rContent += "<option value='" + i + "'>" + values[i] + "</option>";
    }
    rContent += "</select>";
    let row = createRow(lContent, rContent);
    row.id = "row" + id;
    row.className = "row";
    parent.appendChild(row);
    e = document.getElementById(id);
    if (e) {
        e.onchange = (ev) => {
            presetCallback(e.selectedIndex);
        };
    }
}
// END HELPFUL HTML5 CODE
//# sourceMappingURL=htmlutils.js.map