/* eslint-disable no-undef */
const passwordGenerator = require('../utilities/passwordGenerator.util')

test('Password must have length 6', () => {
  expect(passwordGenerator()).toHaveLength(6)
})
