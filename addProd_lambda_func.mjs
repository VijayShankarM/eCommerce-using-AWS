import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const dynamo = DynamoDBDocumentClient.from(client);

export const handler = async (event) => {
    try {
        console.log("Received event:", JSON.stringify(event, null, 2)); // Debugging

        // Ensure event.body exists and is valid JSON
        const body = event.body ? JSON.parse(event.body) : {};

        if (!body.productId || !body.name || !body.price || !body.stock || !body.imageUrl) {
            return {
                statusCode: 400,
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "OPTIONS, GET, POST, PUT, DELETE",
                    "Access-Control-Allow-Headers": "Content-Type"
                },
                body: JSON.stringify("Missing required fields")
            };
        }

        const params = {
            TableName: "Products",
            Item: {
                productId: body.productId,
                name: body.name,
                price: body.price,
                stock: body.stock,
                imageUrl: body.imageUrl // ✅ Added imageUrl field
            },
        };

        await dynamo.send(new PutCommand(params));

        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "OPTIONS, GET, POST, PUT, DELETE",
                "Access-Control-Allow-Headers": "Content-Type"
            },
            body: JSON.stringify({ message: "Product added successfully!" })
        };
    } catch (error) {
        console.error("Error:", error);
        return {
            statusCode: 500,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "OPTIONS, GET, POST, PUT, DELETE",
                "Access-Control-Allow-Headers": "Content-Type"
            },
            body: JSON.stringify({ error: error.message })
        };
    }
};
