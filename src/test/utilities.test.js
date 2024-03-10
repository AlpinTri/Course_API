/* eslint-disable no-undef */
const passwordGenerator = require('../utilities/passwordGenerator.helper')

test('Password must have length 6', () => {
  expect(passwordGenerator()).toHaveLength(6)
})
