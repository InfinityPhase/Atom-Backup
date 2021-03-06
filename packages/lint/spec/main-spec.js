'use babel'
/* eslint-env jasmine */

describe('lint', () => {
  let mainModule = null

  beforeEach(() => {
    waitsForPromise(() => {
      return atom.packages.activatePackage('lint').then((pack) => {
        mainModule = pack.mainModule
      })
    })
  })

  describe('when the lint package is activated', () => {
    it('activates successfully', () => {
      expect(mainModule).toBeDefined()
      expect(mainModule).toBeTruthy()
      expect(mainModule.subscriptions).toBeDefined()
      expect(mainModule.subscriptions).toBeTruthy()
    })
  })
})
