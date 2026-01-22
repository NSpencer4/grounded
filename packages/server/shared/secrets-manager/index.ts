import { GetSecretValueCommand, SecretsManagerClient } from '@aws-sdk/client-secrets-manager'

export const fetchSecrets = async (secretIds: string[]) => {
  const client = new SecretsManagerClient()

  const promises = await Promise.all(
    secretIds.map(async (secretId) => {
      const response = await client.send(new GetSecretValueCommand({ SecretId: secretId }))
      return { secretId, secretValue: response.SecretString }
    }),
  )

  return promises.reduce((acc, { secretId, secretValue }) => {
    acc[secretId] = secretValue
    return acc
  }, {})
}
