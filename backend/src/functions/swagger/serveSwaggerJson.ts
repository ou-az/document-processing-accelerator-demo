import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

/**
 * Handler for serving the Swagger JSON specification
 */
export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    // Include the Swagger JSON directly in the handler
    const swagger = {
      "openapi": "3.0.1",
      "info": {
        "title": "Document Processing Accelerator API",
        "description": "API for managing and processing documents",
        "version": "1.0.0",
        "contact": {
          "name": "API Support",
          "email": "support@example.com",
          "url": "https://example.com/support"
        },
        "termsOfService": "https://example.com/terms"
      },
      "servers": [
        {
          "url": "/dev",
          "description": "Development Server"
        }
      ],
      "components": {
        "securitySchemes": {
          "bearerAuth": {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT",
            "description": "JWT token acquired from AWS Cognito"
          }
        },
        "schemas": {
          "Document": {
            "type": "object",
            "properties": {
              "id": {
                "type": "string",
                "description": "Unique identifier for the document"
              },
              "userId": {
                "type": "string",
                "description": "ID of the user who owns the document"
              },
              "title": {
                "type": "string",
                "description": "Title of the document"
              },
              "documentType": {
                "type": "string",
                "description": "Type of document (INVOICE, RECEIPT, etc.)"
              },
              "status": {
                "type": "string",
                "description": "Processing status of the document",
                "enum": ["PENDING", "PROCESSING", "COMPLETED", "ERROR"]
              },
              "metadata": {
                "type": "object",
                "description": "Additional metadata about the document"
              },
              "s3Key": {
                "type": "string",
                "description": "S3 key where the document file is stored"
              },
              "createdAt": {
                "type": "string",
                "format": "date-time",
                "description": "Timestamp when the document was created"
              },
              "updatedAt": {
                "type": "string",
                "format": "date-time",
                "description": "Timestamp when the document was last updated"
              }
            }
          },
          "DocumentList": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/Document"
            }
          },
          "Error": {
            "type": "object",
            "properties": {
              "message": {
                "type": "string",
                "description": "Error message"
              },
              "error": {
                "type": "string",
                "description": "Error details"
              }
            }
          },
          "SuccessResponse": {
            "type": "object",
            "properties": {
              "message": {
                "type": "string",
                "description": "Success message"
              },
              "id": {
                "type": "string",
                "description": "ID of the affected resource"
              }
            }
          }
        }
      },
      "security": [
        {
          "bearerAuth": []
        }
      ],
      "paths": {
        "/documents": {
          "get": {
            "summary": "List all documents",
            "description": "Returns a list of all documents for the authenticated user",
            "operationId": "getDocuments",
            "tags": ["Documents"],
            "responses": {
              "200": {
                "description": "List of documents",
                "content": {
                  "application/json": {
                    "schema": {
                      "$ref": "#/components/schemas/DocumentList"
                    }
                  }
                }
              }
            }
          },
          "post": {
            "summary": "Create a new document",
            "description": "Creates a new document record",
            "operationId": "createDocument",
            "tags": ["Documents"],
            "responses": {
              "201": {
                "description": "Document created",
                "content": {
                  "application/json": {
                    "schema": {
                      "$ref": "#/components/schemas/Document"
                    }
                  }
                }
              }
            }
          }
        },
        "/documents/{id}": {
          "get": {
            "summary": "Get a document by ID",
            "description": "Returns a specific document by its ID",
            "operationId": "getDocumentById",
            "tags": ["Documents"],
            "parameters": [
              {
                "name": "id",
                "in": "path",
                "description": "ID of the document to retrieve",
                "required": true,
                "schema": {
                  "type": "string"
                }
              }
            ],
            "responses": {
              "200": {
                "description": "Document found",
                "content": {
                  "application/json": {
                    "schema": {
                      "$ref": "#/components/schemas/Document"
                    }
                  }
                }
              }
            }
          },
          "delete": {
            "summary": "Delete a document",
            "description": "Deletes a document by ID",
            "operationId": "deleteDocument",
            "tags": ["Documents"],
            "parameters": [
              {
                "name": "id",
                "in": "path",
                "description": "ID of the document to delete",
                "required": true,
                "schema": {
                  "type": "string"
                }
              }
            ],
            "responses": {
              "200": {
                "description": "Document deleted",
                "content": {
                  "application/json": {
                    "schema": {
                      "$ref": "#/components/schemas/SuccessResponse"
                    }
                  }
                }
              }
            }
          }
        },
        "/documents/{id}/process": {
          "post": {
            "summary": "Process a document",
            "description": "Starts the AI processing of a document",
            "operationId": "processDocument",
            "tags": ["Processing"],
            "parameters": [
              {
                "name": "id",
                "in": "path",
                "description": "ID of the document to process",
                "required": true,
                "schema": {
                  "type": "string"
                }
              }
            ],
            "responses": {
              "200": {
                "description": "Processing started",
                "content": {
                  "application/json": {
                    "schema": {
                      "$ref": "#/components/schemas/Document"
                    }
                  }
                }
              }
            }
          }
        }
      }
    };
    
    // Update the servers configuration based on the request
    if (event.headers && event.headers.Host) {
      const protocol = event.headers['X-Forwarded-Proto'] || 'https';
      const baseUrl = `${protocol}://${event.headers.Host}`;
      const stage = event.requestContext.stage || 'dev';
      
      // Update the server URL to match the current environment
      if (swagger.servers && swagger.servers.length > 0) {
        swagger.servers[0].url = `${baseUrl}/${stage}`;
      }
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify(swagger),
    };
  } catch (error) {
    console.error('Error serving Swagger JSON:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify({
        message: 'Error serving Swagger documentation',
        error: error instanceof Error ? error.message : String(error),
      }),
    };
  }
};
