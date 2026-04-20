import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");
    const errorDescription = searchParams.get("error_description");

    // Handle OAuth error
    if (error) {
      console.error("OAuth error:", error, errorDescription);

      // Return a user-friendly HTML page showing the error
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Canva OAuth Error</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
            .error { background: #fee; border: 1px solid #fcc; padding: 20px; border-radius: 5px; }
            .code { background: #f5f5f5; padding: 10px; border-radius: 3px; font-family: monospace; }
          </style>
        </head>
        <body>
          <h1>Canva OAuth Error</h1>
          <div class="error">
            <h3>Error: ${error}</h3>
            <p>${errorDescription || "Unknown error occurred"}</p>

            ${
              error === "invalid_request" && errorDescription?.includes("redirect_uri")
                ? `
              <p><strong>Solution:</strong> This error occurs because the redirect URI doesn't match what's configured in your Canva app settings.</p>
              <p>To fix this:</p>
              <ol>
                <li>Go to your Canva Developer account</li>
                <li>Update the redirect URI to match your current domain</li>
                <li>Or deploy your app to the production domain</li>
              </ol>
            `
                : ""
            }
          </div>

          <h3>Debug Information:</h3>
          <div class="code">
            State: ${state}<br>
            Error: ${error}<br>
            Description: ${errorDescription}
          </div>

          <p><a href="/">← Back to Home</a></p>
        </body>
        </html>
      `;

      return new NextResponse(html, {
        headers: { "Content-Type": "text/html" },
        status: 400,
      });
    }

    // Handle successful authorization
    if (code) {
      console.log("OAuth success - Authorization code received:");
      console.log("Code:", code);
      console.log("State:", state);

      // For now, just return a success page with the code
      // In production, you'd exchange this for an access token
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Canva OAuth Success</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
            .success { background: #efe; border: 1px solid #cfc; padding: 20px; border-radius: 5px; }
            .code { background: #f5f5f5; padding: 10px; border-radius: 3px; font-family: monospace; word-break: break-all; }
            .copy-btn { background: #007cba; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer; }
          </style>
        </head>
        <body>
          <h1>Canva OAuth Success!</h1>
          <div class="success">
            <p>✅ Authorization successful! You can now use the Canva API.</p>
            <p>The authorization code has been received and logged in the server console.</p>
          </div>

          <h3>Authorization Code:</h3>
          <div class="code" id="code">${code}</div>
          <button class="copy-btn" onclick="navigator.clipboard.writeText('${code}')">Copy Code</button>

          <h3>Next Steps:</h3>
          <ol>
            <li>The authorization code is now available in your server logs</li>
            <li>Use this code with the codeVerifier to get an access token</li>
            <li>You can now create Canva designs for your wedding pages!</li>
          </ol>

          <p><a href="/">← Back to Home</a></p>
        </body>
        </html>
      `;

      return new NextResponse(html, {
        headers: { "Content-Type": "text/html" },
      });
    }

    // No code or error - invalid request
    return NextResponse.json(
      {
        success: false,
        error: "Invalid OAuth callback - missing code or error parameter",
      },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error in Canva OAuth callback:", error);
    return NextResponse.json({ success: false, error: "OAuth callback failed" }, { status: 500 });
  }
}
