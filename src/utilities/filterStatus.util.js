module.exports.filterCourseQuery = (status) => {
  if (status === '0') return { isApproval: null }
  if (status === '1') return { isApproval: false }
  if (status === '2') return { isApproval: true, isGraduate: false }
  if (status === '3') return { isGraduate: true }
  return {}
}

module.exports.filterMemberQuery = (status) => {
  if (status === '0') return { isApproval: null }
  if (status === '1') return { isApproval: false }
  if (status === '2') return { isApproval: true }
  return {}
}
