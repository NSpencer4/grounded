import { GetSecretValueCommand, SecretsManagerClient } from '@aws-sdk/client-secrets-manager'

type SecretMap = Record<string, string>

export const fetchSecrets = async (secretIds: string[]) => {
  const client = new SecretsManagerClient()

  const secretsList = await Promise.all(
    secretIds.map(async (secretId) => {
      const response = await client.send(new GetSecretValueCommand({ SecretId: secretId }))
      return { secretId, secretValue: response.SecretString }
    }),
  )

  return secretsList.reduce((acc: SecretMap, { secretId, secretValue }) => {
    if (secretId && secretValue) {
      acc[secretId] = secretValue
    }
    return acc
  }, {})
}
