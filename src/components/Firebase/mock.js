  class FirebaseMock {
      constructor() {
          this.auth = { onAuthStateChanged: function() {} };
          this.emptyUser = { displayName: '<mock>' };
          this.isMock = true;
      }
  }

  export default FirebaseMock;