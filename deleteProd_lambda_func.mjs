import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, DeleteCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const dynamo = DynamoDBDocumentClient.from(client);

export const handler = async (event) => {
    try {
        console.log("Received event:", JSON.stringify(event, null, 2)); // Debugging

        const productId = event.pathParameters?.productId;
        console.log("Extracted productId:", productId);

        if (!productId) {
            console.error("Missing productId in request!");
            return {
                statusCode: 400,
                headers: { "Access-Control-Allow-Origin": "*" },
                body: JSON.stringify({ error: "Missing productId in path" })
            };
        }

        const params = {
            TableName: "<YOUR_TABLE_NAME>", // 🔁 Changed only this
            Key: { productId }
        };

        console.log("Delete Params:", JSON.stringify(params, null, 2)); // Debugging

        await dynamo.send(new DeleteCommand(params));

        console.log("Product successfully deleted");

        return {
            statusCode: 200,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ message: "Product deleted successfully!" })
        };
    } catch (error) {
        console.error("Error:", error);
        return {
            statusCode: 500,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ error: error.message })
        };
    }
};
