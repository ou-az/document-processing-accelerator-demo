import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

/**
 * Handler for serving the Swagger UI HTML interface
 */
export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    // Include the Swagger UI HTML directly
    let htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Document Processing Accelerator API - Swagger UI</title>
  <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui.css" />
  <link rel="icon" type="image/png" href="https://unpkg.com/swagger-ui-dist@5.9.0/favicon-32x32.png" sizes="32x32" />
  <link rel="icon" type="image/png" href="https://unpkg.com/swagger-ui-dist@5.9.0/favicon-16x16.png" sizes="16x16" />
  <style>
    html {
      box-sizing: border-box;
      overflow: -moz-scrollbars-vertical;
      overflow-y: scroll;
    }
    
    *,
    *:before,
    *:after {
      box-sizing: inherit;
    }
    
    body {
      margin: 0;
      background: #fafafa;
    }
    
    .swagger-header {
      background-color: #1b1b1b;
      color: white;
      padding: 10px 20px;
      margin-bottom: 20px;
    }
    
    .swagger-header h1 {
      margin: 0;
      font-size: 24px;
    }
    
    .swagger-header p {
      margin: 5px 0 0 0;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="swagger-header">
    <h1>Document Processing Accelerator API</h1>
    <p>API Documentation for Document Processing Accelerator</p>
  </div>

  <div id="swagger-ui"></div>

  <script src="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui-bundle.js"></script>
  <script src="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui-standalone-preset.js"></script>
  <script>
    window.onload = function() {
      // Get the current host/origin
      const baseUrl = window.location.origin;
      const apiUrl = baseUrl.includes('localhost') ? './swagger.json' : baseUrl + '/dev/swagger';
      
      // Build a system
      const ui = SwaggerUIBundle({
        url: apiUrl,
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ],
        plugins: [
          SwaggerUIBundle.plugins.DownloadUrl
        ],
        layout: "StandaloneLayout",
        persistAuthorization: true
      });

      window.ui = ui;
    };
  </script>
</body>
</html>`;
    
    // Update the Swagger UI to point to the correct API URL for the current environment
    if (event.headers && event.headers.Host) {
      const protocol = event.headers['X-Forwarded-Proto'] || 'https';
      const baseUrl = `${protocol}://${event.headers.Host}`;
      const stage = event.requestContext.stage || 'dev';
      
      // This replaces the local path with the deployed API URL 
      // The UI script is already programmed to detect the environment 
      // and adjust the path accordingly, but we'll modify it here as well
      const apiUrl = `${baseUrl}/${stage}/swagger`;
      
      // Update the JavaScript to point to the correct swagger.json URL
      htmlContent = htmlContent.replace(
        'const apiUrl = baseUrl.includes(\'localhost\') ? \'./swagger.json\' : baseUrl + \'/dev/swagger\';',
        `const apiUrl = baseUrl.includes('localhost') ? './swagger.json' : '${apiUrl}';`
      );
    }
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/html',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: htmlContent,
    };
  } catch (error) {
    console.error('Error serving Swagger UI:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify({
        message: 'Error serving Swagger UI',
        error: error instanceof Error ? error.message : String(error),
      }),
    };
  }
};
