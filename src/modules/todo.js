export class ToDo {
    constructor(title, dueDate) {
        this.title = title;
        this.dueDate = dueDate;
    }

    // 🛠 Convert JSON back into ToDo objects properly
    static fromJSON(json) {
        return new ToDo(json.title, json.dueDate);
    }
}