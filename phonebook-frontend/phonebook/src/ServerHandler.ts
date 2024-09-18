import axios from "axios";

type Person = { id?: number; name: string; number: number };

async function serverGet() {
    return axios.get("http://localhost:3001/api/persons");
}

async function serverPost(commObject: object) {
    return axios.post("http://localhost:3001/api/persons/", {
        ...commObject,
    });
}
async function serverUpdate(obj: Person, newNumber: string) {
    return axios.put(`http://localhost:3001/api/persons/${obj.id}`, {
        ...obj,
        number: newNumber,
    });
}
async function serverDel(value: Person) {
    if (window.confirm(`Are you sure you want to delete ${value.name}?`)) {
        return axios.delete(`http://localhost:3001/api/persons/${value.id}`);
    } else {
        return undefined;
    }
}

export { serverGet, serverPost, serverDel, serverUpdate };
export type { Person };
