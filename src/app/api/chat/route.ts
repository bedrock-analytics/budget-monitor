// import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
import { type NextRequest, NextResponse } from "next/server";

import {
  BedrockAgentRuntimeClient,
  RetrieveAndGenerateCommand,
} from "@aws-sdk/client-bedrock-agent-runtime";

const client = new BedrockAgentRuntimeClient({
  region: process.env.AWS_REGION || "ap-southeast-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();

    console.log("mes ", message);

    const command = new RetrieveAndGenerateCommand({
      input: {
        text: message,
      },
      retrieveAndGenerateConfiguration: {
        type: "KNOWLEDGE_BASE",
        knowledgeBaseConfiguration: {
          knowledgeBaseId: process.env.KB_ID!,
          modelArn:
            "arn:aws:bedrock:ap-southeast-1:174466744028:inference-profile/apac.anthropic.claude-sonnet-4-20250514-v1:0",

          retrievalConfiguration: {
            vectorSearchConfiguration: {
              numberOfResults: 5,
            },
          },

          orchestrationConfiguration: {
            promptTemplate: {
              textPromptTemplate: `
You are a system that prepares queries for retrieval.

Conversation history:
$conversation_history$

$output_format_instructions$

Rewrite the query for better semantic search:

$query$
`,
            },
          },

          generationConfiguration: {
            promptTemplate: {
              textPromptTemplate: `
You are a helpful assistant answering ONLY from context.

<context>
$search_results$
</context>

Question:
$query$

Answer:
`,
            },
          },
        },
      },
    });

    const response = await client.send(command);
    return NextResponse.json({
      success: true,
      reply: response.output?.text,
    });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// const client = new BedrockRuntimeClient({
//   region: process.env.AWS_REGION
// });

// export async function POST(req: Request) {
//   console.log("POST");
//   const { message } = await req.json();

//   const body = JSON.stringify({
//     anthropic_version: "bedrock-2023-05-31",
//     max_tokens: 500,
//     messages: [
//       {
//         role: "user",
//         content: message
//       }
//     ]
//   });

//   const command = new InvokeModelCommand({
//     modelId: "global.anthropic.claude-sonnet-4-6",
//     body,
//     contentType: "application/json",
//     accept: "application/json"
//   });

//   const response = await client.send(command);

//   const responseBody = JSON.parse(
//     new TextDecoder().decode(response.body)
//   );

//   return Response.json({
//     reply: responseBody.content[0].text
//   });
// }
