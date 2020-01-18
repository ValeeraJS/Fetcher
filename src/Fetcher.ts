import EventDispatcher from '@valeera/eventdispatcher';
import FetcherManager from './FetchManager';

export default class Fetcher extends EventDispatcher {
    public process: number = 0;
    public response: Response;
    public size: number;
    public url: string = "";
    public state: string = Fetcher.IDLING;

    private currentReadData: any = null
    private reader: ReadableStreamReader;
    private stream: ReadableStream;

    static readonly FetcherManager = FetcherManager;
    static readonly STARTED = "started";
    static readonly FINSIHED = "finished";
    static readonly PROGRESSING = "progressing";
    static readonly CANCELLED = "cancelled";
    static readonly ERROR = "error";
    static readonly IDLING = "idling";

    constructor(url: string = "") {
        super();
        this.update(url || "");
    }

    update = (url: string) => {
        this.url = url;
        this.process = 0;
        this.currentReadData = null;
        this.state = Fetcher.IDLING;
        return this;
    }

    cancel = () => {
        if (this.reader) {
            this.state = Fetcher.CANCELLED;
            return this.reader.cancel();
        }
    }

    getCurrentReadSpeed = () => {
        if (!this.currentReadData || !this.currentReadData.value) {
            return 0;
        }
        const arr = this.currentReadData.value;
        return arr.length * arr.constructor.BYTES_PER_ELEMENT;
    }

    fetch = (url: string = this.url, options?: RequestInit) => {
        return fetch(url, options).then((response: Response) => {
            this.response = response;
            const { body, headers } = response;
            this.size = parseInt(headers.get('content-length') || '0', 10);
            if (body) {
                this.reader = body.getReader();
                this.stream = new (ReadableStream as any)({
                    start: (controller: ReadableStreamDefaultController) => {
                        this.state = Fetcher.STARTED;
                        this.dispatch(Fetcher.STARTED, this);
                        const push = () => {
                            this.reader.read().then((res: any) => {
                                this.currentReadData = res;
                                let { done, value } = res;
                                if (done) {
                                    controller.close();
                                    this.currentReadData = null;
                                    this.state = Fetcher.FINSIHED;
                                    this.dispatch(Fetcher.FINSIHED, this);
                                } else {
                                    this.process += this.getCurrentReadSpeed();
                                    this.state = Fetcher.PROGRESSING;
                                    this.dispatch(Fetcher.PROGRESSING, this);
                                }
                                controller.enqueue(value);
                                push();
                            }).catch(() => {
                                this.state = Fetcher.ERROR;
                                this.dispatch(Fetcher.ERROR, this);
                            });
                        };
                        push();
                    },
                    cancel: () => {
                        this.state = Fetcher.CANCELLED;
                        this.dispatch(Fetcher.CANCELLED, this);
                    }
                });
            } else {
                this.state = Fetcher.ERROR;
                this.dispatch(Fetcher.ERROR, this);
            }
            return new Response(this.stream, { headers });
        }).catch((error: any) => {
            this.state = Fetcher.ERROR;
            this.dispatch(Fetcher.ERROR, error);
        });
    }
}