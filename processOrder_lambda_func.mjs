import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, GetCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const dbClient = DynamoDBDocumentClient.from(client);

export const handler = async (event) => {
    try {
        console.log("🟡 Received event:", JSON.stringify(event, null, 2));

        const requestBody = event.body ? JSON.parse(event.body) : {};

        const { name, address, phone, email, cartItems } = requestBody;

        if (!name || !address || !phone || !email || !cartItems) {
            return {
                statusCode: 400,
                headers: { "Access-Control-Allow-Origin": "*" },
                body: JSON.stringify({ error: "Missing required fields" }),
            };
        }

        const items = Array.isArray(cartItems)
            ? cartItems
            : (typeof cartItems === "string" ? JSON.parse(cartItems) : []);

        if (items.length === 0) {
            return {
                statusCode: 400,
                headers: { "Access-Control-Allow-Origin": "*" },
                body: JSON.stringify({ error: "Cart is empty" }),
            };
        }

        // ✅ Step 1: Verify stock
        for (const item of items) {
            const getProductParams = {
                TableName: "<PRODUCTS_TABLE>",
                Key: { productId: item.productId }
            };

            const productResult = await dbClient.send(new GetCommand(getProductParams));

            if (!productResult.Item || productResult.Item.stock === undefined) {
                return {
                    statusCode: 404,
                    headers: { "Access-Control-Allow-Origin": "*" },
                    body: JSON.stringify({ error: `Product not found: ${item.productId}` }),
                };
            }

            const availableStock = parseInt(productResult.Item.stock);
            const requiredQty = parseInt(item.quantity);

            if (requiredQty > availableStock) {
                return {
                    statusCode: 400,
                    headers: { "Access-Control-Allow-Origin": "*" },
                    body: JSON.stringify({ error: `Not enough stock for product ${item.productId}` }),
                };
            }
        }

        // ✅ Step 2: Store order & update stock
        const orderId = Date.now().toString();

        const orderParams = {
            TableName: "<ORDERS_TABLE>",
            Item: {
                orderId,
                name,
                address,
                phone,
                email,
                cartItems: items
            }
        };

        await dbClient.send(new PutCommand(orderParams));

        for (const item of items) {
            const updateStockParams = {
                TableName: "<PRODUCTS_TABLE>",
                Key: { productId: item.productId },
                UpdateExpression: "SET stock = stock - :qty",
                ExpressionAttributeValues: {
                    ":qty": item.quantity
                },
                ReturnValues: "UPDATED_NEW"
            };

            await dbClient.send(new UpdateCommand(updateStockParams));
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
