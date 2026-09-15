const express = require('express')
const Groq = require('groq-sdk')
const cors = require("cors");
const {
    toolRegistry,
    toolDefinitions
  } = require("./tools/toolRegistry");

require("dotenv").config()

const app = express()

const groq = new Groq({
    apikey: process.env.GROQ_API_KEY
})

app.use(express.json())

let conversations = new Map()

app.use(cors());

app.get("/conversationId", (req, res) => {
    let conversationId = crypto.randomUUID()
    conversations.set(conversationId, [])
    res.json({conversationId: conversationId})
})

// Non streaming
app.post("/ask", async (req, res) => {
    const {action, code, question} = req.body
    // let history = conversations.get(conversationId)
    // if(!history){
    //     return res.status(404).json({error: "Conversation id not found"})
    // }
    // history.push({role:"user", content: question})
    // console.log('history1', history)
    // const prompt = `
    // ${question}

    // Here is the code

    // ${code}
    // `
    let withTimeout = (promise, milliseconds) => {
        const timeout = new Promise((_, reject) => {
            setTimeout(() => {
                reject(new Error("AI request timed out"))
            }, milliseconds)
        })
        return Promise.race([promise, timeout])
    }
    console.log("1. Route hit! Received prompt:", req.body);
    let content = ''
    switch(action){
        case 'explain':
            content = `You are an expert JS developer.
            
            Return ONLY valid JSON matching this structure:
            {
                "line": number,
                "explain": string
                }
                
                `
                break;
                case 'find_bugs':
            content = `You are an expert JavaScript code reviewer.

                Analyze the provided code for bugs, runtime errors,
                edge cases, and potential security issues.
                
                Return ONLY valid JSON matching this structure:
                {
                    "hasBugs": boolean,
                "summary": string,
                "bugs": [
                    {
                    "line": number,
                    "issue": string,
                    "severity": "low" | "medium" | "high",
                    "suggestion": string
                    }
                    ],
                    "improvedCode": string
                    }
                    
                    If there are no bugs, return an empty bugs array
                    and hasBugs as false.`
                    break
                }
    // res.setHeader('Content-Type', 'text/event-stream')
    // res.setHeader('Cache-Control', 'no-cache')
    // res.setHeader('Connection', 'keep-alive')

    try {
        console.log("2. Sending request to Groq...");
        const systemMessage = [{ role: "system", content: content}]
        
        const completion = await withTimeout(groq.chat.completions.create({
            model: "openai/gpt-oss-20b", 
            messages: [ ...systemMessage, 
                {role: "user", content: code}
            ],
            response_format: {
                type: "json_object"
            },
            stream: false,
            max_completion_tokens: 500,
            reasoning_effort: "low",
            temperature: 0.1
        }), 3000);

        console.log("3. Completion object created. Starting stream loop...");
        // If this logs, the stream is working!
        console.log("--- New Chunk Received ---", completion); 
        
        // const finalOutput = completion.choices?.[0]?.delta?.content || "";
        const finalOutput = completion.choices?.[0]?.message.content;
        
        try{
            const parsedContent = JSON.parse(finalOutput)
            const validationResult = bugAnalysisSchema.safeParse(parsedContent)
            if (!validationResult.success) {
                return res.status(502).json({
                  error: "AI returned an invalid response format",
                  details: validationResult.error.issues
                });
            }
            
            result = validationResult.data;
        } catch(error) {
            return res.status(502).json({
                error: "AI returned invalid JSON"
            });
        }
        console.log(finalOutput, 'finaloutuot')
        res.write(`${finalOutput}`);

        console.log("4. Stream iteration finished successfully.");
        res.end();

    } catch (error) {
        // Look closely at your terminal logs to see if this error blocks prints out
        console.error("❌ CRITICAL ERROR IN GROQ CALL:", error.message);
        console.error(error);
        
        if (!res.headersSent) {
            res.status(500).json({ error: error.message });
        } else {
            res.end();
        }
    }
})

// Data streaming
app.post("/ask-stream", async (req, res) => {
    const {action, code, question} = req.body
    // let history = conversations.get(conversationId)
    // if(!history){
    //     return res.status(404).json({error: "Conversation id not found"})
    // }
    // history.push({role:"user", content: question})
    // console.log('history1', history)
    // const prompt = `
    // ${question}

    // Here is the code

    // ${code}
    // `
    let withTimeout = (promise, milliseconds) => {
        const timeout = new Promise((_, reject) => {
            setTimeout(() => {
                reject(new Error("AI request timed out"))
            }, milliseconds)
        })
        return Promise.race([promise, timeout])
    }
    console.log("1. Route hit! Received prompt:", req.body);
    let content = ''
    switch(action){
        case 'explain':
            content = `You are an expert JS developer.
            
            Return ONLY valid JSON matching this structure:
            {
                "line": number,
                "explain": string
                }
                
                `
                break;
                case 'find_bugs':
            content = `You are an expert JavaScript code reviewer.

                Analyze the provided code for bugs, runtime errors,
                edge cases, and potential security issues.
                
                Return ONLY valid JSON matching this structure:
                {
                    "hasBugs": boolean,
                "summary": string,
                "bugs": [
                    {
                    "line": number,
                    "issue": string,
                    "severity": "low" | "medium" | "high",
                    "suggestion": string
                    }
                    ],
                    "improvedCode": string
                    }
                    
                    If there are no bugs, return an empty bugs array
                    and hasBugs as false.`
                    break
                }
    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')
    try {
        console.log("2. Sending request to Groq...");
        const systemMessage = [{ role: "system", content: content}]
        
        const completion = await groq.chat.completions.create({
            model: "openai/gpt-oss-20b", 
            messages: [ ...systemMessage, 
                {role: "user", content: code}
            ],
            // response_format: {
            //     type: "json_object"
            // },
            stream: true,
            // max_completion_tokens: 1024,
            max_completion_tokens: 500,
            reasoning_effort: "low",
            temperature: 0.1
        });

        console.log("3. Completion object created. Starting stream loop...");
        let finalOutput = ''
        for await (const chunk of completion) {
            // If this logs, the stream is working!
            console.log("--- New Chunk Received ---", chunk); 
            
            const content = chunk.choices?.[0]?.delta?.content || "";
            
            if (content) {
                console.log("Content payload:", content);
                finalOutput += content
                res.write(`data: ${JSON.stringify(content)}\n\n`)
            }
        }
        res.write(`data: [DONE]\n\n`);
        // history.push({
        //     role: 'assistant',
        //     content: finalOutput
        // })
        // console.log('history2', history)
        // const result = 

        console.log("4. Stream iteration finished successfully.");
        res.end();

    } catch (error) {
        // Look closely at your terminal logs to see if this error blocks prints out
        console.error("❌ CRITICAL ERROR IN GROQ CALL:", error.message);
        console.error(error);
        
        if (!res.headersSent) {
            res.status(500).json({ error: error.message });
        } else {
            res.end();
        }
    }
})

// Tool calling
app.post("/tool-test", async (req, res) => {
    const { code } = req.body;
  
    if (!code || !code.trim()) {
      return res.status(400).json({
        error: "Code is required"
      });
    }
    const messages = [
        {
          role: "system",
          content: `
            You are a developer assistant.
            You may use only the tools provided in the tools list.
            Never invent tool names.
            For documentation questions, use searchDocumentation.
            `
        },
        {
          role: "user",
          content: code
        }
    ];

    try {
        const completion = await groq.chat.completions.create({
            model: "openai/gpt-oss-20b",
            messages: messages,
            tools: toolDefinitions,
            max_completion_tokens: 500,
            tool_choice: "auto",
            temperature: 0.1
        });
  
        const assistantMessage = completion.choices[0].message;

        messages.push(assistantMessage)
        
        if(!assistantMessage.tool_calls?.length){
            return res.json({
                answer: assistantMessage.content
            })
        }

        for (const toolCall of assistantMessage.tool_calls){
            const toolName = toolCall.function.name;
            const toolArguments = JSON.parse(toolCall.function.arguments)
            const selectedTool = toolRegistry[toolName]

            if (!selectedTool) {
                console.error("Unknown tool requested:", {
                  toolName,
                  toolArguments,
                  registeredTools: Object.keys(toolRegistry)
                });
              
                return res.status(400).json({
                  error: `Unknown tool: ${toolName}`
                });
              }
            
            const toolResult = await selectedTool.execute(toolArguments);

            console.log(`Tool Result:`, toolResult)
            messages.push({
                role: "tool",
                tool_call_id: toolCall.id,
                content: JSON.stringify({
                    result: toolResult
                })
            })
        }

        const finalCompletion = await groq.chat.completions.create({
            model: "openai/gpt-oss-20b",
            messages,
            max_completion_tokens: 500,
            temperature: 0.1
          });
        console.log(finalCompletion.choices[0].message, 'final')
        res.json({
            answer: finalCompletion.choices[0].message.content
        });
    } catch (error) {
      console.error("Tool-calling error: ", error);
  
      res.status(500).json({
        error: "Tool-calling request failed"
      });
    }
});


app.listen(3000, () => {
    console.log("Server is running on port 3000")
})