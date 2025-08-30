/* global Vue */
const { createApp } = Vue

//#region vue

const app = createApp({
  data() {
    return {
      SERVER_URL: "http://localhost:9090/jrpc",
      REQUEST_ID: 0,

      first: 1,
      second: 1,

      errors: {},

      liveMode: false,

      output: "Please enter two numbers!",
    }
  },

  watch: {
    liveMode(newVal) {
      // run a first calculation when live mode is turned on
      if (newVal) {
        this.handleFormSubmit()
      }
    },
  },

  methods: {
    async makeJrpcRequest(method, params = {}) {
      // Note, for more complex requests this should be debounced and
      //  make use of an AbortSignal to cancel running, outdated requests

      const id = this.REQUEST_ID++

      const requestData = {
        jsonrpc: "2.0",
        id,
        method,
        params,
      }

      // Fetch response and return the data as JSON.
      // Network errors should be handled by the method calling this
      return fetch(this.SERVER_URL, {
        method: "POST",
        body: JSON.stringify(requestData),
      }).then((response) => response.json())
    },

    handleFormSubmit() {
      // validate form for good measure
      const isValid = this.$refs.form.reportValidity()

      if (isValid) this.makeAddNumbersRequest()
    },

    async makeAddNumbersRequest() {
      // Show a warning when the server's too slow or not responding at all.
      // In a local test environment, responses shouldn't take more than 1-2ms
      // so 50ms is more than enough time for the server to respond before this
      // is ever shown
      const timeout = setTimeout(() => {
        this.output =
          "The server takes longer to respond than usual, please stand by..."
      }, 50)

      const response = await this.makeJrpcRequest("add", {
        first: this.first,
        second: this.second,
      })
        .catch(() => {
          // Any sort of network error will result in the same generic error message for now
          return null
        })
        .finally(() => clearTimeout(timeout))

      if (!response) {
        // Something went wrong with the request itself
        this.output = "Could not communicate with the server."
        return
      }

      if (response.error) {
        // Server received the request, but could not handle it as expected
        // There *should* always be a message attached to the response
        this.output = response.error.message
          ? `The server reported an error: ${response.error.message}`
          : "The server reported an error."
        return
      }

      // Per the spec, there has to be either an error or a result.
      this.output = `Your result is: ${response.result}`
    },

    validateNumberInput(targetEl) {
      const onError = (msg) => {
        this.errors[targetEl.name] = msg
        if (this.liveMode) this.output = "Please enter two valid numbers!"
        return false
      }

      if (!targetEl.value)
        return onError("Please enter a number between 1 and 100")

      const numVal = parseInt(targetEl.value)

      if (numVal != targetEl.value)
        return onError("Please enter a number without fractions")

      if (numVal < 1 || numVal > 100)
        return onError("Please enter a number between 1 and 100")

      // Validation succeeded, clear pervious errors
      this.errors[targetEl.name] = null
      return true
    },

    handleInputChange(evt) {
      // Additional frontend validation
      const isValid = this.validateNumberInput(evt.target)

      if (this.liveMode && isValid) this.makeAddNumbersRequest()
    },
  },
})

//#endregion

//#region page init

// This script is loaded as <script defer>, so we can assume the page is fully loaded by now
app.mount("#vue")

//#endregion
