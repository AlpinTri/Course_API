/* eslint-disable no-undef */
const { url, authorization, request } = require('./index')

describe('Authorization & Authentication', () => {
  it('Login', async () => {
    const response = await request.post(`${url.auth}/login`).send({
      email: 'agusdedi@gmail.com',
      password: '12345678'
    })

    const setCookieHeader = response.headers['set-cookie']
    const cookieValue = setCookieHeader && setCookieHeader.length > 1 ? setCookieHeader[1].split(';')[0] : setCookieHeader[0].split(';')[0]

    authorization.accessToken = response.body.accessToken
    authorization.refreshToken = cookieValue.split('=')[1]

    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty('success')
    expect(response.body).toHaveProperty('message')
    expect(response.body).toHaveProperty('accessToken')
    expect(cookieValue).toBeTruthy()
  })

  it('Refresh', async () => {
    const response = await request.post(`${url.auth}/refresh`).set('Cookie', [`jwt=${authorization.refreshToken}`])

    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty('success')
    expect(response.body).toHaveProperty('message')
    expect(response.body).toHaveProperty('accessToken')
  })

  it('Authorization property must not be null', () => {
    expect(authorization.accessToken).not.toBeNull()
    expect(authorization.refreshToken).not.toBeNull()
  })

  it('Logout', async () => {
    const response = await request.post(`${url.auth}/logout`).set('Cookie', [`jwt=${authorization.refreshToken}`])

    expect(response.status).toBe(204)
  })
})
