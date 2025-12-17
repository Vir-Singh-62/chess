import WebSocket, { WebSocketServer } from "ws";
import chalk from "chalk";

export const clients = new Map<number, WebSocket>();
export const ids = new Map<WebSocket, number>();

export const wss = new WebSocketServer({
  port: parseInt(process.env.PORT || "8080"),
  path: "/socket",
});
console.log(
  chalk.italic.bgCyanBright.bold.greenBright("         Chess Server        ")
);
console.log(
  chalk.bgBlueBright.redBright(
    ` Server started on port ${process.env.PORT || 8080} `
  )
);
console.log(chalk.bgRedBright.gray(" Socket namespace  '/socket' "));
