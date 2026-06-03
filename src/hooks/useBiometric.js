import { supabase } from '../lib/supabase'

export function isSupported() {
  return (
    typeof window !== 'undefined' &&
    !!window.PublicKeyCredential &&
    !!navigator.credentials
  )
}

/**
 * Register a platform authenticator (Face ID / Touch ID) for user.
 * Stores credential ID + biometric_enabled flag in localStorage.
 * axios_refresh_token must already be stored before calling this.
 */
export async function register(user) {
  const credential = await navigator.credentials.create({
    publicKey: {
      challenge: crypto.getRandomValues(new Uint8Array(32)),
      rp: {
        name: 'AXIOS',
        id: window.location.hostname,
      },
      user: {
        id: Uint8Array.from(user.id, c => c.charCodeAt(0)),
        name: user.email,
        displayName: 'AXIOS Member',
      },
      pubKeyCredParams: [{ alg: -7, type: 'public-key' }],
      authenticatorSelection: {
        authenticatorAttachment: 'platform',
        userVerification: 'required',
      },
      timeout: 60000,
    },
  })

  const credentialId = btoa(String.fromCharCode(...new Uint8Array(credential.rawId)))
  localStorage.setItem('axios_credential_id', credentialId)
  localStorage.setItem('axios_biometric_enabled', 'true')

  // Best-effort profile update — don't block on failure
  supabase.from('profiles')
    .update({ biometric_enabled: true })
    .eq('id', user.id)
    .then(() => {})
}

/**
 * Verify the registered platform credential, then restore the Supabase session
 * using the stored refresh token.
 * Returns the restored session on success.
 * Throws on WebAuthn failure, cancelled prompt, or expired refresh token.
 */
export async function authenticate() {
  const credentialId = localStorage.getItem('axios_credential_id')
  const refreshToken = localStorage.getItem('axios_refresh_token')

  if (!credentialId || !refreshToken) {
    throw new Error('No biometric credential stored')
  }

  const assertion = await navigator.credentials.get({
    publicKey: {
      challenge: crypto.getRandomValues(new Uint8Array(32)),
      allowCredentials: [{
        id: Uint8Array.from(atob(credentialId), c => c.charCodeAt(0)),
        type: 'public-key',
      }],
      userVerification: 'required',
      timeout: 60000,
    },
  })

  if (!assertion) throw new Error('Biometric assertion failed')

  const { data, error } = await supabase.auth.refreshSession({ refresh_token: refreshToken })
  if (error) throw error

  // Rotate the stored refresh token
  localStorage.setItem('axios_refresh_token', data.session.refresh_token)

  return data.session
}
