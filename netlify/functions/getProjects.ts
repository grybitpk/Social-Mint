import { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";
import { Client } from "pg";

const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  // Ensure we only handle GET requests
  if (event.httpMethod !== "GET") {
    return { statusCode: 405, body: "Method Not allowed" };
  }

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    // Query the 'projects' table, ordering by the most recently created
    const res = await client.query("SELECT id, name, brand_info, created_at FROM projects ORDER BY created_at DESC");
    
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(res.rows),
    };
  } catch (error) {
    console.error("Database Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to fetch projects." }),
    };
  } finally {
    await client.end();
  }
};

export { handler };
