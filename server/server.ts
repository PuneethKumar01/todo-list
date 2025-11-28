import { Hono } from "hono";

const app = new Hono();

app.get('/', (c) => { return c.text('server is running') });

type Memory = {
    "desc": string,
    "task": string
}

const memory = new Map<string, Memory>();

memory.set("1", { "desc": "i am ", "task": "sleep" })

const generateId = (): string => {
    let id = Math.random().toString(36).slice(2)
    while (memory.has(id)) { Math.random().toString(36).slice(2) }
    return id
}


app.get('/api/tasks/:id', async (c) => {
    const id = c.req.param("id")

    if (!memory.has(id)) {
        return c.text('not data', 404)
    }

    const result = memory.get(id)

    return c.json(result)

})

app.get('/api/tasks', (c) => {
    return c.json(Array.from(memory, (a) => { return { id : a[0], data : a[1]} }))
})

app.post('/api/tasks', async (c) => {
    const body = await c.req.json<Memory>();
    if (!body.task) {
        return c.text("task is required", 400);
    }
    let tempId = generateId()

    memory.set(tempId, { "desc": body.desc, "task": body.task })

    return c.json({"id" : tempId, "data" :  memory.get(tempId)}, 201)

})

app.delete('/api/tasks/:id', (c) => {
    const id = c.req.param('id')

    if (!memory.has(id)) { return c.text('no such id', 404) }

    memory.delete(id)

    return c.body(null, 204)
})

app.patch('/api/tasks/:id', async (c) => {
    const id = c.req.param('id')
    const body = await c.req.json()

    if (!memory.has(id)) { return c.text('no such id', 404) }

    memory.set(id, { 'desc': body.desc, "task": body.task })

    return c.json(memory.get(id), 201)

})

export default {
    port: 3000,
    fetch: app.fetch
};