import Fetcher from "./Fetcher";
import EventDispatcher from "@valeera/eventdispatcher";
export default class FetchManager extends EventDispatcher {
    static readonly TASK_FINISHED = "task_finished";
    static readonly TASK_ERROR = "task_error";
    static readonly PROGRESSING = "progressing";
    static readonly FINISHED = "finished";
    errorTasks: Fetcher[];
    finishedTasks: Fetcher[];
    process: number;
    progressingTasks: Fetcher[];
    size: number;
    tasks: Fetcher[];
    constructor(urls: Array<string | Fetcher>);
    add: (target: string | Fetcher) => this;
    fetch: () => Promise<this>;
}
