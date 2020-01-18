import EventDispatcher from '@valeera/eventdispatcher';
import FetcherManager from './FetchManager';
export default class Fetcher extends EventDispatcher {
    process: number;
    response: Response;
    size: number;
    url: string;
    state: string;
    private currentReadData;
    private reader;
    private stream;
    static readonly FetcherManager: typeof FetcherManager;
    static readonly STARTED = "started";
    static readonly FINSIHED = "finished";
    static readonly PROGRESSING = "progressing";
    static readonly CANCELLED = "cancelled";
    static readonly ERROR = "error";
    static readonly IDLING = "idling";
    constructor(url?: string);
    update: (url: string) => this;
    cancel: () => Promise<void> | undefined;
    getCurrentReadSpeed: () => number;
    fetch: (url?: string, options?: RequestInit | undefined) => Promise<void | Response>;
}
