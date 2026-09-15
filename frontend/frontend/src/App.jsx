import { useState, useRef, useEffect } from "react";

function App() {
    const [code, setCode] = useState("");
    const [action, setAction] = useState("explain");
    const [answer, setAnswer] = useState("");
    const [loading, setLoading] = useState(false);
    const [streamingResponse, setStreamingResponse] = useState('')

    // High-frequency queues and intervals should live in refs to avoid triggering re-renders
    const tokenQueue = useRef([]);
    const typingTimer = useRef(null);

    // 1. This loop runs continuously, pulling items from our queue at a fixed rate
    useEffect(() => {
        typingTimer.current = setInterval(() => {
        if (tokenQueue.current.length > 0) {
            // Grab the next character/token in line
            const nextChunk = tokenQueue.current.shift();
            
            // Update the UI state at a predictable, controlled pace
            setStreamingResponse((prev) => prev + nextChunk);
        }
        }, 25); // 👈 Adjust this speed (milliseconds). Higher = slower typing look.

        return () => clearInterval(typingTimer.current);
    }, []);

    async function handleAnalyzeStream() {';;'
        setLoading(true);
        setAnswer("");
        tokenQueue.current = []; // Reset the queue

        try {
            const response = await fetch("http://localhost:3000/ask-stream", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    action,
                    code,
                    question: "Analyze this code"
                })
            });

            const reader = response.body.getReader();
            console.log(reader, 'reader')
            const decoder = new TextDecoder();

            let accumulatedText = '';
            while(true){
                const { value, done } = await reader.read()

                if (done) break;
                
                const chunk = decoder.decode(value, {stream: true})
                const events = chunk.split("\n\n").filter(Boolean)

                for (const event of events){
                    if(!event.startsWith("data: ")) continue
                    const data = event.slice(6)

                    if(data === '[DONE]') continue

                    try {
                        const token = JSON.parse(data);
                        
                        // 2. Instead of calling setState instantly, push the characters into the queue!
                        // We split by individual characters so they write out smoothly letter-by-letter.
                        tokenQueue.current.push(...token.split(""));
                      } catch (e) {
                        console.error("Parsing error", e);
                      }
                    // const token = JSON.parse(data)
                    // accumulatedText += token
                    // setStreamingResponse(accumulatedText)
                    // console.log(token, 'token')
                    // console.log(accumulatedText, 'accumulatedText')
                }
            }

            setAnswer(JSON.stringify(accumulatedText, null, 2));
        } catch (error) {
            setAnswer("Failed to connect to backend");
            console.log(error, 'error')
        } finally {
            setLoading(false);
        }
    }

    async function handleAnalyze() {
        setLoading(true);
        setAnswer("");

        try {
            const response = await fetch("http://localhost:3000/ask", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    action,
                    code,
                    question: "Analyze this code"
                })
            });

            const data = await response.json()
            console.log(data, 'data new')
            setAnswer(JSON.stringify(data, null, 2));
        } catch (error) {
            setAnswer("Failed to connect to backend");
            console.log(error, 'error')
        } finally {
            setLoading(false);
        }
    }
    return (
        <div>
            <h1>AI Developer Assistant</h1>

            <select
                value={action}
                onChange={(e) => setAction(e.target.value)}
            >
                <option value="explain">Explain Code</option>
                <option value="find_bugs">Find Bugs</option>
                <option value="improve">Improve Code</option>
                <option value="generate_tests">Generate Tests</option>
            </select>

            <br />

            <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Paste your code here..."
                rows={15}
                cols={70}
            />

            <br />

            <button onClick={handleAnalyze} disabled={loading || !code}>
                {loading ? "Analyzing..." : "Analyze"}
            </button>

            <h2>AI Response</h2>

            <div>{streamingResponse}</div>
            <div>{answer}</div>
        </div>
    );
}

export default App;