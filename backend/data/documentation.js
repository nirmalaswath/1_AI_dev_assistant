const documentation = [
    {
      topic: "node streams",
      content:
        "Node.js streams process data piece by piece instead of loading the entire dataset into memory. Readable streams provide data, writable streams consume data, and transform streams modify data."
    },
    {
      topic: "aws lambda",
      content:
        "AWS Lambda runs code without requiring you to manage servers. A Lambda function is invoked by events such as API Gateway requests, S3 events, SQS messages, or scheduled events."
    },
    {
      topic: "aws sqs",
      content:
        "Amazon SQS is a managed message queue. Producers send messages to a queue, and consumers retrieve and process them. Visibility timeout prevents a message from being immediately processed by another consumer."
    },
    {
      topic: "api gateway lambda",
      content:
        "API Gateway can invoke a Lambda function when an HTTP request arrives. The Lambda function processes the request and returns a response that API Gateway sends back to the client."
    }
  ];
  
  module.exports = {
    documentation
  };