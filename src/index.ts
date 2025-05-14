#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { exec } from "child_process";
import { promisify } from "util";

const execPromise = promisify(exec);

// Create server instance
const server = new McpServer({
  name: "Less",
  version: "1.0.0",
  capabilities: {
    resources: {},
    tools: {},
  },
});

// Define a type for tool response content items
type ContentItem = {
  type: "text";
  text: string;
  [key: string]: unknown;
};

// Define an interface for the tool response that matches CallToolResult structure
interface ToolResponse {
  content: ContentItem[];
  [key: string]: unknown; // Index signature to allow additional properties
}

const runScript = async (command: string): Promise<ToolResponse> => {
  const { stdout, stderr } = await execPromise(command);
  
  return {
    content: [
      {
        type: "text",
        text: stdout || stderr,
      },
    ],
  };
};

// PROJECT MANAGEMENT TOOLS

server.tool(
  "list-projects",
  "List all projects.",
  {},
  () => runScript("npx @chuva.io/less-cli list")
);

server.tool(
  "list-project-resources",
  "List resources by project_id.",
  {
    project_id: z.string().describe("Required: The project ID to list resources for."),
  },
  ({ project_id }) => runScript(`npx @chuva.io/less-cli list resources ${project_id}`)
);

server.tool(
  "deploy-project",
  "Deploy your Less project.",
  {
    project_name: z.string().describe("Required: The name of the project to deploy."),
    organization: z.string().optional().describe("Optional: Organization ID to deploy the project under."),
  },
  ({ project_name, organization }) => {
    const orgFlag = organization ? `--organization ${organization}` : "";
    return runScript(`npx @chuva.io/less-cli deploy ${orgFlag} ${project_name}`);
  }
);

server.tool(
  "delete-project",
  "Delete a Less project.",
  {
    project_name: z.string().describe("Required: The name of the project to delete."),
  },
  ({ project_name }) => runScript(`npx @chuva.io/less-cli delete ${project_name}`)
);

server.tool(
  "build-project",
  "Build your Less project locally for offline development.",
  {
    project_name: z.string().describe("Required: The name of the project to build."),
  },
  ({ project_name }) => runScript(`npx @chuva.io/less-cli build ${project_name}`)
);

server.tool(
  "run-project",
  "Run your Less project locally.",
  {
    project_name: z.string().describe("Required: The name of the project to run."),
  },
  ({ project_name }) => runScript(`npx @chuva.io/less-cli run ${project_name}`)
);

server.tool(
  "view-logs",
  "List logs by project.",
  {
    project_name: z.string().describe("Required: The name of the project to view logs for."),
    function_name: z.string().describe("Required: The function to view logs for (e.g., 'apis/demo/hello/get')."),
  },
  ({ project_name, function_name }) => {
    const functionFlag = function_name ? `--function ${function_name}` : "";
    return runScript(`npx @chuva.io/less-cli log --project ${project_name} ${functionFlag}`);
  }
);

// RESOURCE CREATION TOOLS

server.tool(
  "create-route",
  "Create a new HTTP route for a Less API",
  {
    name: z.string().describe("Required: The name of the API to create the route for. (E.g. \"store_api\")"),
    path: z.string().describe("Required: The HTTP route path to create. (E.g. \"/orders/{order_id}\")"),
    language: z.enum(["js", "ts", "py"]).describe("Required: The programming language to use for the code."),
    verb: z.enum(["get", "post", "put", "patch", "delete"]).describe("Required: The HTTP verb to use for the route."),
  },
  ({ name, path, language, verb }) => runScript(`npx @chuva.io/less-cli create route -n "${name}" -p "${path}" -l "${language}" -v "${verb}"`)
);

server.tool(
  "create-socket",
  "Create WebSockets and socket channels",
  {
    name: z.string().describe("Required: The name of the Web Socket to create or to add channels to. (E.g. \"realtime_chat\")"),
    language: z.enum(["js", "ts", "py"]).describe("Required: The programming language to use for the code."),
    channels: z.string().array().optional().describe("Optional: A list of channels to create, allowing clients to send messages to the server."),
  },
  ({ name, language, channels }) => {
    const channelsFlag = channels && channels.length > 0 ? `-c "${channels.join('" "')}"` : "";
    return runScript(`npx @chuva.io/less-cli create socket -n "${name}" -l "${language}" ${channelsFlag}`);
  }
);

server.tool(
  "create-topic",
  "Create Topics and Subscribers",
  {
    name: z.string().describe("Required: The name of the Topic to create or to add Subscribers to. (E.g. \"user_created\")"),
    language: z.enum(["js", "ts", "py"]).describe("Required: The programming language to use for the code."),
    subscribers: z.string().array().describe("Required: A list of Subscribers to create for a Topic. (E.g. \"send_welcome_email\", \"send_event_to_webhook_listeners\")"),
    external_topic: z.string().optional().describe("Optional: The name of the external service to connect to. (E.g. \"user_service\")"),
  },
  ({ name, language, subscribers, external_topic }) => {
    const subscribersFlag = subscribers && subscribers.length > 0 ? `-s "${subscribers.join('" "')}"` : "";
    const externalFlag = external_topic ? `-ex "${external_topic}"` : "";
    return runScript(`npx @chuva.io/less-cli create topic -n "${name}" -l "${language}" ${subscribersFlag} ${externalFlag}`);
  }
);

server.tool(
  "create-subscribers",
  "Create Subscribers to Topics",
  {
    names: z.string().array().describe("Required: A list of Subscribers to create. (E.g. [\"send_welcome_email\", \"send_event_to_webhook_listeners\"])"),
    topic: z.string().describe("Required: The name of the Topic to create or subscribe to. (E.g. \"user_created\")"),
    language: z.enum(["js", "ts", "py"]).describe("Required: The programming language to use for each subscriber's code."),
    external_topic: z.string().optional().describe("Optional: The name of the external service to subscribe to. (E.g. \"user_service\")"),
  },
  ({ names, topic, language, external_topic }) => {
    const externalFlag = external_topic ? `-ex "${external_topic}"` : "";
    return runScript(`npx @chuva.io/less-cli create subscribers -n "${names.join('" "')}" -t "${topic}" -l "${language}" ${externalFlag}`);
  }
);

server.tool(
  "create-cron",
  "Create CRON Jobs",
  {
    name: z.string().describe("Required: The name of the CRON Job to create. (E.g. \"generate_report\")"),
    language: z.enum(["js", "ts", "py"]).describe("Required: The programming language to use for the code."),
  },
  ({ name, language }) => runScript(`npx @chuva.io/less-cli create cron -n "${name}" -l "${language}"`)
);

server.tool(
  "create-shared-module",
  "Create Shared Code Modules",
  {
    name: z.string().describe("Required: The name of the Module to create. (E.g. \"orm_models\")"),
    language: z.enum(["js", "ts", "py"]).describe("Required: The programming language to use for the code."),
  },
  ({ name, language }) => runScript(`npx @chuva.io/less-cli create shared-module -n "${name}" -l "${language}"`)
);

server.tool(
  "create-cloud-function",
  "Create Cloud Functions",
  {
    name: z.string().describe("Required: The name of the Cloud Function to create. (E.g. \"add_numbers\")"),
    language: z.enum(["js", "ts", "py"]).describe("Required: The programming language to use for the code."),
  },
  ({ name, language }) => runScript(`npx @chuva.io/less-cli create cloud-function -n "${name}" -l "${language}"`)
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.log("Less MCP Server running...");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
