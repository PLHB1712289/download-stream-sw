/// <reference lib="webworker" />
/* eslint-disable no-restricted-globals */

import { PrecacheController } from "workbox-precaching";
import { SWAction, SWResponse } from "./types";

declare const self: ServiceWorkerGlobalScope;

const manifest = self.__WB_MANIFEST;
if (manifest) {
  new PrecacheController().addToCacheList(manifest);
}

self.addEventListener("install", (event) => {
  return event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  return event.waitUntil(self.clients.claim());
});

// Download stream...
const listURLSetup = new Map<string, ReadableStream>();

self.addEventListener("fetch", (event) => {
  const url = event.request.url;

  const stream = listURLSetup.get(url);

  if (stream) {
    const fileName = new URL(url).pathname.split("/").reverse()[0];
    const headers = new Headers({
      "Content-Type": "application/octet-stream; charset=utf-8",
      "Content-Security-Policy": "default-src 'none'",
      "X-Content-Security-Policy": "default-src 'none'",
      "X-WebKit-CSP": "default-src 'none'",
      "X-XSS-Protection": "1; mode=block",
    });

    headers.set(
      "Content-Disposition",
      "attachment; filename*=UTF-8''" + encodeURIComponent(fileName).replace(/['()]/g, escape).replace(/\*/g, "%2A")
    );

    const response = new Response(stream, { status: 200, headers });
    event.respondWith(response);
    listURLSetup.delete(url);
    return;
  }

  return fetch(url);
});

self.addEventListener("message", (event) => {
  const action = event.data as SWAction;

  if (!action.type || !action.data) {
    return;
  }

  const port = event.ports[0];

  if (action.type === "setup") {
    const fileName = (action.data.fileName as string) || "default.txt";

    const size = (action.data.size as number) || -1;
    const urlSetup = self.registration.scope + Math.random() + "/" + fileName;
    const stream = createStream(port);

    listURLSetup.set(urlSetup, stream);

    port.postMessage({ type: "setup", data: { urlSetup } } as SWResponse);
    return;
  }
});

function createStream(port: MessagePort): ReadableStream {
  const stream = new ReadableStream({
    start(controller) {
      port.onmessage = (event: MessageEvent<SWAction>) => {
        const action = event.data;

        if (!action.type) {
          return;
        }

        if (action.type === "push") {
          controller.enqueue(new Uint8Array(action.data));
          port.postMessage({ type: "push", data: true } as SWResponse);
          return;
        }

        if (action.type === "close") {
          console.log("close...");
          controller.close();
          port.postMessage({ type: "close", data: true } as SWResponse);
          return;
        }
      };
    },
  });

  return stream;
}
