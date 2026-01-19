import { DynamoDBClient, DynamoDBClientConfig } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb'

export class DynamoDbConnection {
  public ddbClient: DynamoDBClient
  public ddbDoc: DynamoDBDocument

  constructor(tableEndpoint: string, region: string) {
    const dynamoConfig: DynamoDBClientConfig = {
      endpoint: tableEndpoint,
      region,
    }

    // Set dynamo creds

    this.ddbClient = new DynamoDBClient(dynamoConfig)
    this.ddbDoc = DynamoDBDocument.from(this.ddbClient, {
      marshallOptions: { removeUndefinedValues: true },
    })
  }
}
