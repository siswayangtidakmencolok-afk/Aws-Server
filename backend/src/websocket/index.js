/**
 * WebSocket (Chat) Lambda Function
 * Handles real-time chat via API Gateway WebSocket.
 * Messages are stored in DynamoDB.
 */

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const {
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand,
  DeleteCommand,
} = require('@aws-sdk/lib-dynamodb');
const {
  ApiGatewayManagementApiClient,
  PostToConnectionCommand,
} = require('@aws-sdk/client-apigatewaymanagementapi');

const dynamoClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dynamoClient);

const CHAT_TABLE = process.env.CHAT_TABLE || 'chat_sessions';
const CONNECTIONS_TABLE = process.env.CONNECTIONS_TABLE || 'ws_connections';

/**
 * $connect — WebSocket connection handler.
 * Stores the connection ID in DynamoDB.
 */
exports.connectHandler = async (event) => {
  const connectionId = event.requestContext.connectionId;
  const userId = event.queryStringParameters?.userId || 'anonymous';

  try {
    await docClient.send(
      new PutCommand({
        TableName: CONNECTIONS_TABLE,
        Item: {
          connectionId,
          userId,
          connectedAt: Date.now(),
          ttl: Math.floor(Date.now() / 1000) + 86400, // 24h TTL
        },
      })
    );

    console.log(`Connected: ${connectionId} (user: ${userId})`);
    return { statusCode: 200, body: 'Connected' };
  } catch (err) {
    console.error('Connect error:', err);
    return { statusCode: 500, body: 'Failed to connect' };
  }
};

/**
 * $disconnect — WebSocket disconnection handler.
 * Removes the connection ID from DynamoDB.
 */
exports.disconnectHandler = async (event) => {
  const connectionId = event.requestContext.connectionId;

  try {
    await docClient.send(
      new DeleteCommand({
        TableName: CONNECTIONS_TABLE,
        Key: { connectionId },
      })
    );

    console.log(`Disconnected: ${connectionId}`);
    return { statusCode: 200, body: 'Disconnected' };
  } catch (err) {
    console.error('Disconnect error:', err);
    return { statusCode: 500, body: 'Failed to disconnect' };
  }
};

/**
 * sendMessage — Handle incoming chat messages.
 * Saves to DynamoDB chat_sessions table and relays to recipient.
 */
exports.sendMessageHandler = async (event) => {
  const connectionId = event.requestContext.connectionId;
  const domain = event.requestContext.domainName;
  const stage = event.requestContext.stage;

  try {
    const body = JSON.parse(event.body);
    const { action, sessionId, message, recipientId } = body;

    if (!sessionId || !message) {
      return { statusCode: 400, body: 'sessionId and message are required' };
    }

    const timestamp = Date.now();

    // Save message to DynamoDB chat_sessions table
    await docClient.send(
      new PutCommand({
        TableName: CHAT_TABLE,
        Item: {
          session_id: sessionId,
          timestamp,
          sender_connection_id: connectionId,
          sender_id: body.senderId || 'unknown',
          message,
          type: body.type || 'text',
        },
      })
    );

    console.log(`Message saved: session=${sessionId}, timestamp=${timestamp}`);

    // Find recipient connections and relay the message
    if (recipientId) {
      const connections = await docClient.send(
        new QueryCommand({
          TableName: CONNECTIONS_TABLE,
          IndexName: 'userId-index',
          KeyConditionExpression: 'userId = :uid',
          ExpressionAttributeValues: {
            ':uid': recipientId,
          },
        })
      );

      const apigw = new ApiGatewayManagementApiClient({
        endpoint: `https://${domain}/${stage}`,
      });

      const messagePayload = JSON.stringify({
        action: 'message',
        sessionId,
        senderId: body.senderId,
        message,
        type: body.type || 'text',
        timestamp,
      });

      // Send to all recipient connections
      const sendPromises = (connections.Items || []).map(async (conn) => {
        try {
          await apigw.send(
            new PostToConnectionCommand({
              ConnectionId: conn.connectionId,
              Data: messagePayload,
            })
          );
        } catch (err) {
          if (err.statusCode === 410) {
            // Connection is stale, remove it
            await docClient.send(
              new DeleteCommand({
                TableName: CONNECTIONS_TABLE,
                Key: { connectionId: conn.connectionId },
              })
            );
          }
        }
      });

      await Promise.all(sendPromises);
    }

    return { statusCode: 200, body: 'Message sent' };
  } catch (err) {
    console.error('Send message error:', err);
    return { statusCode: 500, body: 'Failed to send message' };
  }
};

/**
 * getChatHistory — Retrieve chat history for a session.
 * (Invoked via REST API, not WebSocket)
 */
exports.getChatHistoryHandler = async (event) => {
  try {
    const sessionId = event.pathParameters?.sessionId;

    if (!sessionId) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'sessionId is required' }),
      };
    }

    const result = await docClient.send(
      new QueryCommand({
        TableName: CHAT_TABLE,
        KeyConditionExpression: 'session_id = :sid',
        ExpressionAttributeValues: {
          ':sid': sessionId,
        },
        ScanIndexForward: true, // chronological order
        Limit: 100,
      })
    );

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify(result.Items || []),
    };
  } catch (err) {
    console.error('Get chat history error:', err);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Failed to fetch chat history' }),
    };
  }
};
