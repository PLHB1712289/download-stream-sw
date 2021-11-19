import { SWAction, SWResponse } from "./types";

class DownloaderStream {
  static MIN_SIZE = 8;

  private fileName: string;
  private urlDownload: string = "";
  private fileSize: number = -1;
  private port: MessagePort | null = null;
  private currentSize: number = 0;
  private isDownloaded: boolean = false;

  constructor(fileName: string, size: number) {
    this.fileName = fileName;
    this.fileSize = size;
  }

  async setUpDownload(): Promise<boolean> {
    if (navigator.serviceWorker) {
      const sw = (await navigator.serviceWorker.ready).active;

      if (!sw) return false;

      return new Promise((res, rej) => {
        const newChanel = new MessageChannel();
        const port1 = newChanel.port1;
        this.port = port1;

        port1.start();

        port1.onmessage = (event: MessageEvent<SWResponse>) => {
          const response = event.data;

          if (response.type === "setup") {
            this.urlDownload = response.data.urlSetup as string;
            console.log(this.urlDownload);
            res(true);
          }
        };

        port1.onmessageerror = () => {
          res(false);
        };

        sw.postMessage({ type: "setup", data: { fileName: this.fileName, size: this.fileSize } } as SWAction, [
          newChanel.port2,
        ]);
      });
    }

    return false;
  }

  async push(data: ArrayBuffer): Promise<boolean> {
    if (!this.urlDownload || !this.port) {
      console.log("Push failed");
      return false;
    }

    this.currentSize += data.byteLength;

    // Auto download when current size > 8.
    // when data in Readable stream < 8, browser will not download
    if (this.currentSize > DownloaderStream.MIN_SIZE && !this.isDownloaded) {
      const newIframe = document.createElement("iframe");
      newIframe.src = this.urlDownload;
      newIframe.hidden = true;
      document.body.appendChild(newIframe);
      this.isDownloaded = true;

      setTimeout(() => {
        document.body.removeChild(newIframe);
      }, 3000);
    }

    console.log("push data success");
    const action: SWAction = { type: "push", data };
    this.port.postMessage(action, [action.data as ArrayBuffer]);
    return true;
  }

  async close(): Promise<boolean> {
    if (!this.urlDownload || !this.port) {
      console.log("close failed");
      return false;
    }

    const action: SWAction = { type: "close", data: null };

    this.port.postMessage(action);
    return true;
  }
}

export default DownloaderStream;
