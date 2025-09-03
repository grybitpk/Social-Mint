import { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";
import { Client } from "pg";

const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  // Ensure we only handle POST requests
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    if (!event.body) {
        return { statusCode: 400, body: JSON.stringify({ error: "Missing request body" }) };
    }

    // The frontend sends `UserInput` as `brandInfo`.
    // It contains topic, details, url.
    const { name, brandInfo } = JSON.parse(event.body);

    if (!name || !brandInfo || !brandInfo.url) {
      return { statusCode: 400, body: JSON.stringify({ error: "Missing required project fields: name and brandInfo with a URL are required." }) };
    }

    await client.connect();
    
    const query = "INSERT INTO projects(name, brand_info) VALUES($1, $2) RETURNING id, name, brand_info, created_at";
    const values = [name, brandInfo];
    
    const result = await client.query(query, values);
    const newProject = result.rows[0];

    return {
      statusCode: 201, // 201 Created
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newProject),
    };
  } catch (error) {
    console.error("Database Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to create project." }),
    };
  } finally {
    await client.end();
  }
};

export { handler };
