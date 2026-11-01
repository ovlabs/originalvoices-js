import { Command } from "commander";
import * as client from "../client.js";
import { isJsonMode, printAskResult, printError, printJson } from "../output.js";

// The old named sizes, kept so existing scripts keep working.
const NAMED_SAMPLE_SIZES: Record<string, number> = {
  low: 10,
  medium: 25,
  high: 50,
  very_high: 100,
};

function parseSampleSize(value: string | undefined): number | undefined {
  if (value === undefined) return undefined;
  if (value in NAMED_SAMPLE_SIZES) return NAMED_SAMPLE_SIZES[value];
  const n = Number(value);
  if (!Number.isInteger(n) || n < 1) {
    printError("--sample-size must be a whole number, or low, medium, high or very_high.");
    process.exit(1);
  }
  return n;
}

export function registerAskCommand(program: Command): void {
  program
    .command("ask")
    .description("Ask questions to Digital Twins")
    .argument("<questions...>", "One or more questions to ask")
    .option("--audience <prompt>", "Audience description (e.g. 'women 25-35 in the US')")
    .option("--audience-id <id>", "Saved audience ID")
    .option("--study <id>", "Study ID: ask its participants")
    .option("--filter <filter>", "Narrow a study's participants, e.g. 'said price was the main barrier'")
    .option("--type <type>", "Question type: open or choices", "open")
    .option("--choices <items>", "Comma-separated choices (for --type choices)")
    .option("--multiple-choice", "Allow multiple selections (for choices type)")
    .option(
      "--sample-size <size>",
      "How many Twins answer: a number, or low (10), medium (25), high (50), very_high (100)"
    )
    .action(async (questions: string[], opts) => {
      try {
        const targets = [opts.audience, opts.audienceId, opts.study].filter(Boolean);
        if (targets.length !== 1) {
          printError("Provide exactly one of --audience, --audience-id or --study.");
          process.exit(1);
        }
        if (opts.filter && !opts.study) {
          printError("--filter only works with --study.");
          process.exit(1);
        }

        let choices: string[] | undefined;
        if (opts.type === "choices") {
          if (!opts.choices) {
            printError("--choices is required when using --type choices");
            process.exit(1);
          }
          choices = opts.choices.split(",").map((c: string) => c.trim());
        }

        const res = await client.ask({
          target: {
            audience: opts.audience,
            audienceId: opts.audienceId,
            studyId: opts.study,
          },
          // With --type choices, every question gets the same options.
          questions: questions.map((question, i): client.AskQuestion => {
            const id = `q${i + 1}`;
            return choices
              ? {
                  id,
                  type: "choice",
                  question,
                  choices,
                  isMultipleChoice: Boolean(opts.multipleChoice),
                }
              : { id, type: "open", question };
          }),
          sampleSize: parseSampleSize(opts.sampleSize),
          filter: opts.filter,
        });

        if (isJsonMode()) return printJson(res);
        printAskResult(res);
      } catch (err) {
        if (err instanceof client.OVApiError) {
          if (isJsonMode()) {
            printJson({ error: err.code, message: err.message });
          } else {
            printError(`${err.message} (${err.code})`);
          }
          process.exit(1);
        }
        throw err;
      }
    });
}
