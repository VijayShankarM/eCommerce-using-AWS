import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, GetCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const dynamo = DynamoDBDocumentClient.from(client);

export const handler = async (event) => {
    try {
        console.log("🟡 Received event:", JSON.stringify(event, null, 2));

        const body = event.body ? JSON.parse(event.body) : {};

        if (!body.name || !body.address || !body.phone || !body.email || !body.cartItems) {
            return {
                statusCode: 400,
                headers: { "Access-Control-Allow-Origin": "*" },
                body: JSON.stringify({ error: "Missing required fields" }),
            };
        }

        const cartItems = Array.isArray(body.cartItems)
            ? body.cartItems
            : (typeof body.cartItems === "string" ? JSON.parse(body.cartItems) : []);

        if (cartItems.length === 0) {
            return {
                statusCode: 400,
                headers: { "Access-Control-Allow-Origin": "*" },
                body: JSON.stringify({ error: "Cart is empty" }),
            };
        }

        // Step 1: Check Stock for Each Product
        for (const item of cartItems) {
            const getStockParams = {
                TableName: "Products",
                Key: { productId: item.productId }
            };

            const productData = await dynamo.send(new GetCommand(getStockParams));

            if (!productData.Item || !productData.Item.stock) {
                return {
                    statusCode: 404,
                    headers: { "Access-Control-Allow-Origin": "*" },
                    body: JSON.stringify({ error: `Product not found: ${item.productId}` }),
                };
            }

            const currentStock = parseInt(productData.Item.stock);
            const orderQuantity = parseInt(item.quantity);

            if (orderQuantity > currentStock) {
                return {
                    statusCode: 400,
                    headers: { "Access-Control-Allow-Origin": "*" },
                    body: JSON.stringify({ error: `Not enough stock for product ${item.productId}` }),
                };
            }
        }

        // Step 2: Place Order & Reduce Stock
        const orderId = Date.now().toString();

        // Save Order in "Orders" Table
        const orderParams = {
            TableName: "Orders",
            Item: {
                orderId,
                name: body.name,
                address: body.address,
                phone: body.phone,
                email: body.email,
                cartItems
            }
        };

        await dynamo.send(new PutCommand(orderParams));

        // Reduce Stock for Each Product
        for (const item of cartItems) {
            const updateStockParams = {
                TableName: "Products",
                Key: { productId: item.productId },
                UpdateExpression: "SET stock = stock - :orderQuantity",
                ExpressionAttributeValues: {
                    ":orderQuantity": item.quantity
                },
                ReturnValues: "UPDATED_NEW"
            };

            await dynamo.send(new UpdateCommand(updateStockParams));
        }

        return {
            statusCode: 200,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ message: "Order placed successfully!", orderId }),
        };
    } catch (error) {
        console.error("🔴 Error:", error);
        return {
            statusCode: 500,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ error: error.message }),
        };
    }
};
