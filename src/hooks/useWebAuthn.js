import { supabase } from '../lib/supabase'

export const webAuthnSupported = () =>
  typeof window !== 'undefined' && !!window.PublicKeyCredential

function bufToBase64(buffer) {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)))
}

function base64ToBuf(base64) {
  const bin = atob(base64)
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  return bytes.buffer
}

export async function registerBiometric(user) {
  const challenge = crypto.getRandomValues(new Uint8Array(32))

  const credential = await navigator.credentials.create({
    publicKey: {
      challenge,
      rp: { name: 'Axios', id: window.location.hostname },
      user: {
        id: new TextEncoder().encode(user.id),
        name: user.email || user.id,
        displayName: 'Axios Admin',
      },
      pubKeyCredParams: [
        { alg: -7,   type: 'public-key' },
        { alg: -257, type: 'public-key' },
      ],
      authenticatorSelection: {
        authenticatorAttachment: 'platform',
        userVerification: 'required',
        residentKey: 'preferred',
      },
      timeout: 60000,
    },
  })

  const credId = bufToBase64(credential.rawId)

  // Replace any old credential for this user
  await supabase.from('webauthn_credentials').delete().eq('user_id', user.id)
  const { error } = await supabase.from('webauthn_credentials').insert({
    user_id:     user.id,
    credential_id: credId,
    public_key:  credId,
  })
  if (error) throw new Error('Failed to save credential: ' + error.message)

  return credId
}

export async function verifyBiometric(userId) {
  const { data, error } = await supabase
    .from('webauthn_credentials')
    .select('credential_id')
    .eq('user_id', userId)
    .single()

  if (error || !data) throw new Error('No registered device. Register this device first.')

  const challenge  = crypto.getRandomValues(new Uint8Array(32))
  const credBuffer = base64ToBuf(data.credential_id)

  const assertion = await navigator.credentials.get({
    publicKey: {
      challenge,
      allowCredentials: [{ id: credBuffer, type: 'public-key', transports: ['internal'] }],
      userVerification: 'required',
      timeout: 60000,
    },
  })

  return !!assertion
}

export async function hasRegisteredDevice(userId) {
  const { data } = await supabase
    .from('webauthn_credentials')
    .select('id')
    .eq('user_id', userId)
    .single()
  return !!data
}
