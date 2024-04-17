/* eslint-disable array-callback-return */
module.exports.countData = (data) => {
  const calc = data.reduce((acc, item) => {
    const date = new Date(item.date)
    const month = date.getMonth()
    const year = date.getFullYear()
    const now = new Date().getFullYear()
    if (year === now) {
      if (acc[month]) {
        acc[month] = acc[month] + 1
      } else {
        acc[month] = 1
      }

      return acc
    }
  }, {})

  const count = []

  for (let i = 0; i < 12; i++) {
    if (calc[i]) {
      count[i] = calc[i]
    } else {
      count[i] = 0
    }
  }

  return count
}
