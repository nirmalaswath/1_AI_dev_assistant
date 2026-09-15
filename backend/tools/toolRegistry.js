const {
    checkCodeQuality
  } = require("./codeQualityTool");
  
  const {
    searchDocumentation
  } = require("./documentationTool");
  
  const toolRegistry = {
    checkCodeQuality: {
      definition: {
        type: "function",
        function: {
          name: "checkCodeQuality",
          description:
            "Check JavaScript code for lint errors and warnings.",
          parameters: {
            type: "object",
            properties: {
              code: {
                type: "string",
                description: "JavaScript source code"
              }
            },
            required: ["code"],
            additionalProperties: false
          }
        }
      },
      execute: ({ code }) => checkCodeQuality(code)
    },
  
    searchDocumentation: {
        definition: {
          type: "function",
          function: {
            name: "searchDocumentation",
            description:
              "Search internal technical documentation. Always use this tool when the user asks about Node.js, AWS, SQS, Lambda, API Gateway, or other documented technical topics.",
            parameters: {
              type: "object",
              properties: {
                query: {
                  type: "string",
                  description:
                    "The exact technical topic to search, for example: AWS SQS visibility timeout"
                }
              },
              required: ["query"],
              additionalProperties: false
            }
          }
        },
        execute: ({ query }) => searchDocumentation(query)
    }
  };
  
  const toolDefinitions = Object.values(toolRegistry).map(
    (tool) => tool.definition
  );
  
  module.exports = {
    toolRegistry,
    toolDefinitions
  };