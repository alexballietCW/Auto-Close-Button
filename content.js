  let anyToolbarButtonSelector = '.page-actions__left.reply-bar-wrapper-top button'
  waitForElement(anyToolbarButtonSelector).then(() => {
    console.log('%cFound a toolbar button!!!', 'color: blue');


    //Check if element with id auto-close already exists
    let autoCloseElement = document.getElementById('auto-close');
    if (!autoCloseElement) {
      //Add autoclose button
      let toolbar = document.querySelector('div.page-actions__left.reply-bar-wrapper-top')
      //clone secont to last (merge) button
      let btn = toolbar.children[toolbar.childElementCount - 2].cloneNode(true)
      //insert new button after merge button
      toolbar.insertBefore(btn, toolbar.children[toolbar.childElementCount - 1])
      //remove icon from new button
      btn.children[0].remove()
      //set text of new button
      btn.innerText = "Auto-close"
      //update id
      btn.id = "auto-close"
      //remove data-test-actions prop from new button
      btn.removeAttribute('data-test-actions')
      //remove data-identifyelement
      btn.removeAttribute('data-identifyelement')
      //update aria-label
      btn.setAttribute('aria-label', 'Auto-close')

      // //add click event to new button
      btn.addEventListener('click', function () {
        runAutoClose()
      })
    }
  })

  async function runAutoClose() {
    await changeResolution()
    await changeStatus()
    clickUpdateBtn()
  }

  /**
   * Wait for an element before resolving a promise
   * @param {String} querySelector - Selector of element to wait for
   * @param {Integer} timeout - Milliseconds to wait before timing out, or 0 for no timeout              
   */
  function waitForElement(querySelector, timeout) {
    return new Promise((resolve, reject) => {
      var timer = false;
      if (document.querySelectorAll(querySelector).length)
        return resolve();
      const observer = new MutationObserver(() => {
        if (document.querySelectorAll(querySelector).length) {
          observer.disconnect();
          if (timer !== false)
            clearTimeout(timer);
          return resolve();
        }
      });
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
      if (timeout)
        timer = setTimeout(() => {
          observer.disconnect();
          reject();
        }, timeout);
    });
  }

  /**
   * Wait for an element to disappear from the document before resolving a promise
   * @param {String} querySelector - Selector of element to wait for
   * @param {Integer} timeout - Milliseconds to wait before timing out, or 0 for no timeout
   */
  function waitForElementToDisappear(querySelector, timeout) {
    return new Promise((resolve, reject) => {
      var timer = false;
      if (!document.querySelectorAll(querySelector).length)
        return resolve();
      const observer = new MutationObserver(() => {
        if (!document.querySelectorAll(querySelector).length) {
          observer.disconnect();
          if (timer !== false)
            clearTimeout(timer);
          return resolve();
        }
      });
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
      if (timeout)
        timer = setTimeout(() => {
          observer.disconnect();
          reject();
        }, timeout);
    });
  }

  function changeStatus() {
    return new Promise((res, rej) => {
      //1. trigger dropdown
      let dropdown = document.querySelector('div[data-test-id="Status"] .ember-power-select-trigger')
      dropdown.dispatchEvent(new MouseEvent('mousedown'));
      //2. waitForElement
      let anyStatusItemSelector = '.ember-power-select-options.ember-view li'
      let statusPromise = waitForElement(anyStatusItemSelector, 10000)

      //3. trigger item
      statusPromise.then(() => {

        let statusCollection = document.querySelector('.ember-power-select-options.ember-view').children
        let dropdownIndex = findElementByInnerText(statusCollection, /closed/i)
        console.log("Status dropdown index: " + dropdownIndex)

        let item = document.querySelector(`.ember-power-select-options.ember-view li[data-option-index="${dropdownIndex}"]`)
        let event = new MouseEvent('mouseup', {
          isTrusted: true,
          bubbles: true
        });
        item.dispatchEvent(event)
        waitForElementToDisappear(anyStatusItemSelector).then(() => {
          res()
        })
      })
    })
  }

  function changeResolution() {
    return new Promise((res, rej) => {
      //1. trigger dropdown
      let resolutionDropdown = document.querySelector('div[data-test-id="Ticket Resolution Type"] .ember-power-select-trigger')
      resolutionDropdown.dispatchEvent(new MouseEvent('mousedown'));
      //2. call waitForElement on an item that will appear in the dropdown
      let anyItemSelector = '.ember-power-select-options.ember-view li'
      let resolutionPromise = waitForElement(anyItemSelector, 10000)
      //3. wait for dropdown to populate
      resolutionPromise.then(() => {

        let resCollection = document.querySelector('.ember-power-select-options.ember-view').children
        let dropdownIndex = findElementByInnerText(resCollection, /automated/i)
        console.log("Resolution dropdown index: " + dropdownIndex)

        let item = document.querySelector(`.ember-power-select-options.ember-view li[data-option-index="${dropdownIndex}"]`)
        let event = new MouseEvent('mouseup', {
          isTrusted: true,
          bubbles: true
        });
        item.dispatchEvent(event)
        waitForElementToDisappear(anyItemSelector).then(() => {
          res()
        })
      })
    })
  }

  function clickUpdateBtn() {
    let updateBtn = document.querySelector('[data-test-id="ticket-properties-btn"]');
    updateBtn.click()
  }

  function htmlCollectionToArray(htmlCollection) {
    return Array.prototype.slice.call(htmlCollection);
  }

  function findElementByInnerText(htmlCollection, regex) {
    let array = Array.prototype.slice.call(htmlCollection);
    for (let i = 0; i < array.length; i++) {
      if (array[i].innerText.match(regex)) {
        return i;
      }
    }
    return -1;
  }