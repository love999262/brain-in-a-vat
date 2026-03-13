import type { CharacterViewModel } from "@brain-vat/engine-core";

export interface Live2DMountResult {
  status: "ready" | "fallback" | "error";
  detail?: string;
}

export interface Live2DMountedInstance {
  update(character: CharacterViewModel): Promise<Live2DMountResult>;
  destroy(): void;
}

type PixiModule = {
  Application: new () => {
    init(options: unknown): Promise<void>;
    stage: {
      addChild(child: unknown): void;
    };
    destroy(removeView?: boolean): void;
  };
};
type Live2DDisplayModule = {
  Live2DModel?: {
    from(url: string): Promise<{
      scale: { set(value: number): void };
      x: number;
      y: number;
      destroy(): void;
    }>;
  };
};

function getImporter(): (specifier: string) => Promise<unknown> {
  return new Function("specifier", "return import(specifier)") as (specifier: string) => Promise<unknown>;
}

function createFallbackView(container: HTMLElement, character: CharacterViewModel): HTMLElement {
  const poster = document.createElement(character.live2d.posterUrl ? "img" : "div");
  poster.className = "brain-vat-live2d-fallback";

  if (poster instanceof HTMLImageElement && character.live2d.posterUrl) {
    poster.src = character.live2d.posterUrl;
    poster.alt = `${character.name} poster`;
  } else {
    poster.textContent = character.name;
  }

  container.replaceChildren(poster);
  return poster;
}

export async function mountLive2D(container: HTMLElement, character: CharacterViewModel): Promise<Live2DMountedInstance> {
  let destroyPixi: (() => void) | undefined;

  const fallback = async (): Promise<Live2DMountResult> => {
    createFallbackView(container, character);
    return {
      status: "fallback",
      detail: character.live2d.detail ?? "当前使用静态 fallback 展示。"
    };
  };

  const mount = async (nextCharacter: CharacterViewModel): Promise<Live2DMountResult> => {
    if (!nextCharacter.live2d.modelUrl) {
      return fallback();
    }

    try {
      const importModule = getImporter();
      const pixi = (await importModule("pixi.js")) as PixiModule;
      const live2d = (await importModule("pixi-live2d-display")) as Live2DDisplayModule;
      if (!live2d.Live2DModel) {
        return fallback();
      }

      (globalThis as typeof globalThis & { PIXI?: PixiModule }).PIXI = pixi;
      container.replaceChildren();
      const canvas = document.createElement("canvas");
      canvas.className = "brain-vat-live2d-canvas";
      container.append(canvas);

      const app = new pixi.Application();
      await app.init({
        canvas,
        resizeTo: container,
        backgroundAlpha: 0
      });

      const model = await live2d.Live2DModel.from(nextCharacter.live2d.modelUrl);
      model.scale.set(0.18);
      model.x = container.clientWidth / 2;
      model.y = container.clientHeight * 0.9;
      app.stage.addChild(model as never);

      destroyPixi = () => {
        model.destroy();
        app.destroy(true);
      };

      return {
        status: "ready",
        detail: "Live2D 已接入渲染链路。"
      };
    } catch (error) {
      destroyPixi?.();
      destroyPixi = undefined;
      createFallbackView(container, nextCharacter);
      return {
        status: "fallback",
        detail: error instanceof Error ? error.message : "Live2D 初始化失败，已降级为静态展示。"
      };
    }
  };

  await mount(character);

  return {
    update(nextCharacter) {
      destroyPixi?.();
      destroyPixi = undefined;
      return mount(nextCharacter);
    },
    destroy() {
      destroyPixi?.();
      destroyPixi = undefined;
      container.replaceChildren();
    }
  };
}
