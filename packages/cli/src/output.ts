import chalk from "chalk";
import Table from "cli-table3";
import type { AskResult } from "./client.js";

let jsonMode = false;

export function setJsonMode(enabled: boolean): void {
  jsonMode = enabled;
}

export function isJsonMode(): boolean {
  return jsonMode;
}

export function printJson(data: unknown): void {
  console.log(JSON.stringify(data, null, 2));
}

export function printTable(
  headers: string[],
  rows: string[][]
): void {
  const table = new Table({
    head: headers.map((h) => chalk.bold(h)),
    style: { head: [] },
  });
  for (const row of rows) {
    table.push(row);
  }
  console.log(table.toString());
}

export function printSuccess(message: string): void {
  console.log(chalk.green(message));
}

export function printError(message: string): void {
  console.error(chalk.red(message));
}

export function printWarning(message: string): void {
  console.log(chalk.yellow(message));
}

export function printAskResult(data: AskResult): void {
  console.log(chalk.dim(`${data.asked} Twins answered\n`));

  for (const q of data.questions) {
    console.log(chalk.bold(q.question));
    console.log(chalk.dim("─".repeat(60)));

    if (q.results) {
      const sorted = [...q.results].sort((a, b) => b.percentage - a.percentage);
      for (const r of sorted) {
        const pct = `${Math.round(r.percentage)}%`;
        const bar = "█".repeat(Math.round(r.percentage / 2));
        console.log(
          `  ${chalk.cyan(pct.padStart(4))} ${chalk.dim(bar)} ${r.choice} ${chalk.dim(`(${r.count} picked)`)}`
        );
      }
    } else {
      let n = 0;
      for (const p of data.participants) {
        const a = p.answers[q.id];
        if (!a || !("answer" in a)) continue;
        n++;
        const who = p.demographics
          ? chalk.dim(`${p.demographics.gender}, ${p.demographics.age ?? "?"}, ${p.demographics.country}`)
          : "";
        console.log(`  ${chalk.cyan(`${n}.`)} ${a.answer} ${chalk.dim(`(${a.confidence})`)} ${who}`);
      }
    }
    console.log();
  }
}
