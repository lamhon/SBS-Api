export class ResponseData<D> {
    status: string;
    data: D | D[];
    message: string;

    constructor(status: string, data: D | D[], message: string) {
        this.status = status;
        this.data = data;
        this.message = message;

        return this;
    }
}