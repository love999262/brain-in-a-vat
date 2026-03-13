import type {
  CapabilityProfile,
  ModelGenerationResult,
  ModelProvider,
  ProviderStatus
} from "@brain-vat/engine-core";

interface WebLlmOptions {
  modelId?: string;
}

type WebLlmModule = {
  CreateMLCEngine?: (
    modelId: string,
    options?: {
      initProgressCallback?: (report: { progress: number; text: string }) => void;
    }
  ) => Promise<{
    chat: {
      completions: {
        create: (request: {
          messages: Array<{ role: string; content: string }>;
          temperature?: number;
        }) => Promise<{ choices?: Array<{ message?: { content?: string } }> }>;
      };
    };
  }>;
};

function getImporter(): (specifier: string) => Promise<unknown> {
  return new Function("specifier", "return import(specifier)") as (specifier: string) => Promise<unknown>;
}

function formatInitError(error: unknown): string {
  if (!(error instanceof Error)) {
    return "WebLLM 初始化失败，已切换到降级模型。";
  }

  if (error.message.includes("@mlc-ai/web-llm")) {
    return "当前环境未准备好 WebLLM 运行依赖，已切换到降级模型。";
  }

  return error.message;
}

function buildFallbackText(input: {
  characterName: string;
  personaSummary: string;
  traitHints: string[];
  memorySnippets: string[];
  sourceHighlights: string[];
  conversation: Array<{ role: string; content: string }>;
}): string {
  const latestUserMessage = [...input.conversation].reverse().find((message) => message.role === "user")?.content ?? "";
  const memoryHint = input.memorySnippets[0] ? `我还记得刚才提到过：${input.memorySnippets[0]}。` : "";
  const sourceHint = input.sourceHighlights[0] ? `最近我又被这个点吸引住了：${input.sourceHighlights[0]}。` : "";
  const traitHint = input.traitHints.slice(0, 2).join("、");

  return `${input.characterName}：从我的${input.personaSummary}视角看，${latestUserMessage || "这个话题"}挺值得继续聊。${memoryHint}${sourceHint}我会保持${traitHint}这条底色来回应你。`;
}

export function createWebLlmModelProvider(options: WebLlmOptions = {}): ModelProvider {
  let capability: CapabilityProfile | null = null;
  let engine: Awaited<ReturnType<NonNullable<WebLlmModule["CreateMLCEngine"]>>> | null = null;
  let status: ProviderStatus = {
    status: "idle",
    label: "WebLLM 待初始化"
  };

  return {
    name: "WebLLM 模型",
    async initialize(input) {
      capability = input.capabilityProfile;
      status = {
        status: "loading",
        label: "正在尝试初始化 WebLLM"
      };

      if (!capability.webGpuAvailable) {
        status = {
          status: "degraded",
          label: "WebLLM 已降级",
          details: "当前环境没有可用 WebGPU，将使用占位模型回复。"
        };
        return;
      }

      try {
        const importModule = getImporter();
        const webllm = (await importModule("@mlc-ai/web-llm")) as WebLlmModule;
        if (typeof webllm.CreateMLCEngine !== "function") {
          throw new Error("未检测到可用的 WebLLM CreateMLCEngine API。");
        }

        engine = await webllm.CreateMLCEngine(options.modelId ?? "Qwen2.5-3B-Instruct-q4f32_1-MLC", {
          initProgressCallback(report) {
            status = {
              status: "loading",
              label: "正在加载 WebLLM",
              details: `${report.text} (${Math.round(report.progress * 100)}%)`
            };
          }
        });

        status = {
          status: "ready",
          label: options.modelId ?? "Qwen WebLLM",
          details: "本地模型已接管回复生成。"
        };
      } catch (error) {
        engine = null;
        status = {
          status: "degraded",
          label: "WebLLM 初始化失败",
          details: formatInitError(error)
        };
      }
    },
    async generate(input): Promise<ModelGenerationResult> {
      if (!engine) {
        return {
          text: buildFallbackText(input),
          provider: "fallback-model",
          degraded: true,
          notes: [status.details ?? "当前使用降级模型。"]
        };
      }

      try {
        const promptMessages = [
          {
            role: "system",
            content: `你是 ${input.characterName}。${input.personaSummary}`
          },
          ...input.conversation.map((message) => ({
            role: message.role,
            content: message.content
          }))
        ];

        const response = await engine.chat.completions.create({
          messages: promptMessages,
          temperature: 0.8
        });
        const text = response.choices?.[0]?.message?.content?.trim();

        return {
          text: text && text.length > 0 ? text : buildFallbackText(input),
          provider: status.label,
          degraded: false
        };
      } catch (error) {
        status = {
          status: "degraded",
          label: "WebLLM 生成失败",
          details: error instanceof Error ? error.message : "生成失败，已切回降级模型。"
        };

        return {
          text: buildFallbackText(input),
          provider: "fallback-model",
          degraded: true,
          notes: [status.details ?? "模型生成失败。"]
        };
      }
    },
    getStatus() {
      return status;
    }
  };
}
