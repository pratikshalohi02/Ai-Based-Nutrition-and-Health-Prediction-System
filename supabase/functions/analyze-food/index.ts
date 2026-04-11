// Setup type definitions for built-in Supabase Runtime APIs
import "@supabase/functions-js/edge-runtime.d.ts"

import { serve } from "sift";

// CORS headers for cross-origin requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

// Handle preflight OPTIONS requests
function handleOptions() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

// Main handler for POST requests
async function handlePost(req: Request) {
  try {
    const body = await req.json();
    
    // Log the received request body to console
    console.log("Received request body:", JSON.stringify(body, null, 2));
    
    // Return success response with the received body
    return new Response(
      JSON.stringify({
        message: "Function is working!",
        received: body,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error) {
    console.error("Error processing request:", error);
    
    return new Response(
      JSON.stringify({
        error: "Invalid JSON body or processing error",
        details: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  }
}

// Sift router for handling routes
serve({
  "/": async (req: Request) => {
    if (req.method === "OPTIONS") {
      return handleOptions();
    }
    
    if (req.method === "POST") {
      return handlePost(req);
    }
    
    return new Response(
      JSON.stringify({ error: "Method not allowed. Use POST or OPTIONS." }),
      {
        status: 405,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  },
});
