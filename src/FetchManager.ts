import Fetcher from "./Fetcher";
import EventDispatcher from "@valeera/eventdispatcher";

export default class FetchManager extends EventDispatcher {

    public static readonly TASK_FINISHED = "task_finished";
    public static readonly TASK_ERROR = "task_error";
    public static readonly PROGRESSING = "progressing";
    public static readonly FINISHED = "finished";
    public errorTasks: Fetcher[] = [];
    public finishedTasks: Fetcher[] = [];
    public process: number = 0;
    public progressingTasks: Fetcher[] = [];
    public size: number = 0;
    public tasks: Fetcher[] = [];

    constructor(urls: Array<string | Fetcher>) {
        super();
        urls.forEach((url: string | Fetcher) => {
            this.add(url);
        });
    }

    add = (target: string | Fetcher) => {
        if (typeof target === 'string') {
            target = new Fetcher(target);
        }
        target.on(Fetcher.STARTED, (event) => {
            this.size += event.target.size;
        }).on(Fetcher.PROGRESSING, (event) => {
            this.process += event.target.process;
            this.dispatch(FetchManager.PROGRESSING, this);
        }).once(Fetcher.PROGRESSING, (event) => {
            this.progressingTasks.push(event.target);
        }).on(Fetcher.FINSIHED, (event) => {
            this.finishedTasks.push(event.target.size);
            this.dispatch(FetchManager.TASK_FINISHED, event.target);
        }).on(Fetcher.ERROR, (event) => {
            this.errorTasks.push(event.target.size);
            this.dispatch(FetchManager.TASK_ERROR, event.target);
        });
        this.tasks.push(target);
        return this;
    }

    fetch = async () => {
        const arr: Promise<any>[] = [];
        this.tasks.forEach((fetcher: Fetcher) => {
            arr.push(fetcher.fetch());
        });
        return Promise.all(arr).then(() => {
            return this;
        });
    }
}