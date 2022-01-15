/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */

  
  /**
   * Object representing the status bar.
   */
  function StatusBar() {  
    this.setStatus = function(status) {
      document.getElementById("status").innerHTML = status;
    };
  }
  