import { transformFile, Options as TransformOptions } from "@swc/core";
import { SnowpackConfig, SnowpackPlugin } from "snowpack";

type Options = {
  input?: Array<string>;
  transformOptions?: TransformOptions;
};

export default function plugin(
  snowpackConfig: SnowpackConfig,
  options: Options = {}
): SnowpackPlugin {
  // options validation
  if (options) {
    if (typeof options !== "object")
      throw new Error(`options isn’t an object. Please see README.`);
    if (options.input && !Array.isArray(options.input))
      throw new Error(
        `options.input must be an array (e.g. ['.js', '.mjs', '.jsx', '.ts', '.tsx'])`
      );
    if (options.input && !options.input.length)
      throw new Error(`options.input must specify at least one filetype`);
  }

  return {
    name: "snowpack-plugin-swc",
    resolve: {
      input: options.input || [".js", ".mjs", ".jsx", ".ts", ".tsx"],
      output: [".js"], // always export JS
    },
    async load({ filePath }) {
      if (!filePath) return;

      const { transformOptions = {} } = options;

      const { code, map } = await transformFile(filePath, {
        sourceMaps: snowpackConfig.buildOptions.sourceMaps,
        ...transformOptions,
      });

      return {
        ".js": {
          code,
          map,
        },
      };
    },
  };
}
