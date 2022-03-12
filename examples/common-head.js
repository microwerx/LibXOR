/* export toggle */

/**
 * toggle
 * @param {string} id Switches the element's .style.display between 'none' and ''.
 */
function toggle(id) {
    let e = document.getElementById(id);
    if (e) {
        e.style.display = e.style.display === 'none' ? '' : 'none';
    }
}
