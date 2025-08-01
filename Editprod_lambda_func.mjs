import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { UpdateItemCommand } from "@aws-sdk/client-dynamodb";

const dynamo = new DynamoDBClient({ region: "us-east-1" });

export const handler = async (event) => {
    console.log("🟡 Received event:", JSON.stringify(event, null, 2));

    try {
        // Handle CORS Preflight (OPTIONS request)
        if (event.httpMethod === "OPTIONS") {
            return {
                statusCode: 200,
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "OPTIONS, GET, POST, PUT, DELETE",
                    "Access-Control-Allow-Headers": "Content-Type",
                },
                body: JSON.stringify({ message: "CORS preflight successful" }),
            };
        }

        if (!event.body) {
            console.log("🔴 Missing request body");
            return {
                statusCode: 400,
                headers: { "Access-Control-Allow-Origin": "*" },
                body: JSON.stringify({ error: "Missing request body" }),
            };
        }

        const body = JSON.parse(event.body);
        console.log("🟡 Parsed body:", body);

        if (!body.productId || !body.name || !body.price || !body.stock || !body.imageUrl) {
            console.log("🔴 Missing required fields");
            return {
                statusCode: 400,
                headers: { "Access-Control-Allow-Origin": "*" },
                body: JSON.stringify({ error: "Missing required fields" }),
            };
        }

        const params = {
            TableName: "<YOUR_TABLE_NAME>", // 🔁 Replace with your actual DynamoDB table name
            Key: { productId: { S: body.productId } },
            UpdateExpression: "SET #n = :n, price = :p, stock = :s, imageUrl = :img",
            ExpressionAttributeNames: { "#n": "name" },
            ExpressionAttributeValues: {
                ":n": { S: body.name },
                ":p": { N: body.price.toString() },
                ":s": { N: body.stock.toString() },
                ":img": { S: body.imageUrl } // You can also use "<YOUR_BUCKET_NAME>/path/to/image" in frontend
            },
            ReturnValues: "UPDATED_NEW"
        };

        console.log("🟡 Sending update command to DynamoDB:", params);
        const response = await dynamo.send(new UpdateItemCommand(params));
        console.log("✅ Update response:", response);

        return {
            statusCode: 200,
            headers: { 
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "OPTIONS, GET, POST, PUT, DELETE",
                "Access-Control-Allow-Headers": "Content-Type",
            },
            body: JSON.stringify({ message: "Product updated successfully!" }),
        };
    } catch (error) {
        console.error("🔴 Error updating product:", error);
        return {
            statusCode: 500,
            headers: { 
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "OPTIONS, GET, POST, PUT, DELETE",
                "Access-Control-Allow-Headers": "Content-Type",
            },
            body: JSON.stringify({ error: error.message }),
        };
    }
};
