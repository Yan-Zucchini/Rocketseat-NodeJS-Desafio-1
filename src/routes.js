import { randomUUID } from "node:crypto"
import { Database } from "./database.js"
import { buildRoutePath } from "./utils/build-route-path.js"


const database = new Database()


export const routes = [
    {
        method: 'GET',
        path: buildRoutePath('/tasks'),
        handler: (req, res) => {
            const { search } = req.query
            
            const tasks = database.select('tasks', search ? {
                title: search,
                description: search,
            } : null)
        
            return res.end(JSON.stringify(tasks))
        }
    },
    {
        method: 'POST',
        path: buildRoutePath('/tasks'),
        handler: (req, res)=>{
            
            const { title, description } = req.body

            if(!title){
                return res.writeHead(400).end(
                    JSON.stringify({message: 'You need to add a title!'})
                )
            }

            if(!description){
                return res.writeHead(400).end(
                    JSON.stringify({message: 'You need to add a description!'})
                )
            }
            
            const task = {
                id: randomUUID(),
                title,
                description,
                created_at: new Date(),
                updated_at: new Date(),
                completed_at: null,
            }

            database.insert('tasks', task)
        
            return res.writeHead(201).end()
        }
    },
    {
        method: 'PUT',
        path: buildRoutePath('/tasks/:id'),
        handler: (req, res) => {
            const { id } = req.params
            const {title, description} = req.body

            
            const [task] = database.select('tasks', { id })

            console.log(title)

            if(!task){
                return res.writeHead(404).end()
            }
            
            const updated_at = new Date()


            !title ? database.update('tasks',id, {
                ...task,
                description,
                updated_at,
            })

            : !description ? database.update('tasks',id, {
                ...task,
                title,
                updated_at,
            }) 

            : 
            database.update('tasks',id, {
                ...task,
                title,
                description,
                updated_at,
            }) 


            return res.writeHead(204).end()
        }
    },
    {
        method: 'DELETE',
        path: buildRoutePath('/tasks/:id'),
        handler: (req, res) => {
            const { id } = req.params

            const [task] = database.select('tasks', { id })

            if(!task){
                return res.writeHead(404).end()
            }

            database.delete('tasks',id)

            return res.writeHead(204).end()
        }
    },
    {
        method: 'PATCH',
        path: buildRoutePath('/tasks/:id/complete'),
        handler: (req, res) => {
            const { id } = req.params

            const [task] = database.select('tasks', { id })

            console.log(task)
            
            if(!task){
                return res.writeHead(404).end()
            }

            if(task.completed_at == null){
                const completed_at = new Date()
                database.update('tasks', id, {...task, completed_at})
                return res.writeHead(204).end()
            }else{
                return res.writeHead(400).end(
                    JSON.stringify({ message: 'Esta tarefa já esta completa'})
                )
            }


        }
    },
    {
        method: 'PATCH',
        path: buildRoutePath('/tasks/:id'),
        handler: (req, res) => {
            const { id } = req.params

            const [task] = database.select('tasks', { id })

            console.log(task)
            
            if(!task){
                return res.writeHead(404).end()
            }

            if(task.completed_at == null){
                return res.writeHead(400).end(
                    JSON.stringify({ message: 'Esta tarefa não está completa'})
                    )
            }else{
                const completed_at = null
                database.update('tasks', id, {...task, completed_at})
                return res.writeHead(204).end()
            }
        }
    }
]