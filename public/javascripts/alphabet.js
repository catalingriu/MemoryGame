/* eslint-disable no-unused-vars */
//@ts-check

const USED = -1; //letter has been used, not available anymore
const AVAIL = 1; //letter has not been used yet

function Alphabet() {
  this.letters = undefined;

  this.initialize = function () {
    this.letters = {
      A: AVAIL,
      B: AVAIL,
      C: AVAIL,
      D: AVAIL,
      E: AVAIL,
      F: AVAIL,
      G: AVAIL,
      H: AVAIL,
      I: AVAIL,
      J: AVAIL,
      K: AVAIL,
      L: AVAIL,
      M: AVAIL,
      N: AVAIL,
      O: AVAIL,
      P: AVAIL,
      Q: AVAIL,
      R: AVAIL,
      S: AVAIL,
      T: AVAIL,
      U: AVAIL,
      V: AVAIL,
      W: AVAIL,
      X: AVAIL,
      Y: AVAIL,
      Z: AVAIL,

    };
  };

  this.setImages = function(images) {
    for(let i=1; i <= 30; i++) {
      let image = document.createElement("img");
      image.src = "images/" + images[i-1];
  
      let div = document.getElementById(""+i);
      div.appendChild(image);
     }
  };
  /**
   * Checks whether the input is a letter.
   * @param {string} letter
   * @returns {boolean} true if `letter` is a letter, false otherwise
   */
  this.isLetter = function (letter) {
    return Object.prototype.hasOwnProperty.call(this.letters, letter);
  };

  /**
   * Checks whether the input letter is available.
   * @param {string} letter
   * @returns {boolean} true if `letter` is available, false otherwise
   */
  this.isLetterAvailable = function (letter) {
    return this.isLetter(letter) && this.letters[letter] == AVAIL;
  };

  /**
   * Makes a letter unavailable for further use.
   * @param {string} letter
   */
  this.makeLetterUnAvailable = function (letter) {
    if (this.isLetter(letter)) {
      this.letters[letter] = USED;

      //switch off the UI element by adding the 'disabled' class name (defined in game.css)
      document.getElementById(letter).className += " disabled";
    }
  };

  /**
   * Checks if letter `letter` appears in word `word`.
   * @param {*} letter Letter to check
   * @param {*} word Word to check
   * @returns {boolean} true if `letter` appears in `word`, false otherwise
   */
  this.isLetterIn = function (letter, word) {
    if (!this.isLetter(letter) || !this.isLetterAvailable(letter)) {
      return false;
    }
    return word.indexOf(letter) >= 0;
  };


}
