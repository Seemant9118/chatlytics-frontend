import { GoogleGenerativeAI } from "@google/generative-ai";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { config } from 'dotenv';
import readline from "readline/promises";
config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not set");
}

else {
    class MCPClient {
        private mcp: Client;
        private Gemini: GoogleGenerativeAI;
        private transport: StdioClientTransport | null = null;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        private tools: any[] = [];
        private model: ReturnType<GoogleGenerativeAI["getGenerativeModel"]>;

        constructor() {
            this.Gemini = new GoogleGenerativeAI(GEMINI_API_KEY!);
            this.mcp = new Client({ name: "mcp-client-cli", version: "1.0.0" });

            // Initialize Gemini 2.5 Flash model
            this.model = this.Gemini.getGenerativeModel({ model: "gemini-2.5-flash" });
        }

        async connectToServer(serverScriptPath: string) {
            try {
                const isJs = serverScriptPath.endsWith(".js");
                const isPy = serverScriptPath.endsWith(".py");
                if (!isJs && !isPy) {
                    throw new Error("Server script must be a .js or .py file");
                }

                const command = isPy
                    ? process.platform === "win32"
                        ? "python"
                        : "python3"
                    : process.execPath;

                this.transport = new StdioClientTransport({
                    command,
                    args: [serverScriptPath],
                });
                await this.mcp.connect(this.transport);

                const toolsResult = await this.mcp.listTools();
                this.tools = toolsResult.tools.map((tool) => {
                    return {
                        name: tool.name,
                        description: tool.description,
                        input_schema: {
                            ...tool.inputSchema,
                            type: tool.inputSchema.type ?? "object",
                        },
                    };
                });
                console.log(
                    "Connected to server with tools:",
                    this.tools.map(({ name }) => name)
                );
            } catch (e) {
                console.log("Failed to connect to MCP server: ", e);
                throw e;
            }
        }

        async processQuery(query: string) {
            // Call Gemini 2.5 Flash properly
            const response = await this.model.generateContent({
                contents: [
                    {
                        role: "user",
                        parts: [{ text: query }],
                    },
                ],
            });

            // Extract text output
            const text = response.response.text();
            console.log(text);

            return text;
        }

        async chatLoop() {
            const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout,
            });

            try {
                console.log("\nMCP Client Started!");
                console.log("Type your queries or 'quit' to exit.");

                while (true) {
                    const message = await rl.question("\nQuery: ");
                    if (message.toLowerCase() === "quit") {
                        break;
                    }
                    const response = await this.processQuery(message);
                    console.log("\n" + response);
                }
            } finally {
                rl.close();
            }
        }

        async cleanup() {
            await this.mcp.close();
        }
    }

    async function main() {
        if (process.argv.length < 3) {
            console.log("Usage: node index.ts <path_to_server_script>");
            return;
        }
        const mcpClient = new MCPClient();
        try {
            await mcpClient.connectToServer(process.argv[2]);
            await mcpClient.chatLoop();
        } finally {
            await mcpClient.cleanup();
            process.exit(0);
        }
    }

    main();
}
