import jwt from 'jsonwebtoken'

const EXPIRY = '15m'

type Payload = {
  email: string
  orderID: string
}

const getSecret = () => {
  const secret = process.env.PAYLOAD_SECRET

  if (!secret) {
    throw new Error('PAYLOAD_SECRET is required for order access tokens.')
  }

  return secret
}

export const createOrderAccessToken = ({ email, orderID }: Payload) =>
  jwt.sign({ email, orderID }, getSecret(), { expiresIn: EXPIRY })

export const verifyOrderAccessToken = ({
  email,
  orderID,
  token,
}: Payload & { token: string }) => {
  try {
    const decoded = jwt.verify(token, getSecret())

    if (!decoded || typeof decoded !== 'object') {
      return false
    }

    return decoded.email === email && decoded.orderID === orderID
  } catch {
    return false
  }
}
