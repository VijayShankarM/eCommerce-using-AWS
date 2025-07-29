import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const dynamo = DynamoDBDocumentClient.from(client);

export const handler = async (event) => {
    try {
        console.log("🟢 Getting all orders");

        const params = {
            TableName: "Orders"
        };

        const result = await dynamo.send(new ScanCommand(params));

        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "*",
                "Access-Control-Allow-Methods": "GET,OPTIONS"
            },
            body: JSON.stringify(result.Items || []),
        };
    } catch (error) {
        console.error("🔴 Error fetching orders:", error);
        return {
            statusCode: 500,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "*",
                "Access-Control-Allow-Methods": "GET,OPTIONS"
            },
            body: JSON.stringify({ error: error.message }),
        };
    }
};
