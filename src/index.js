const express = require('express')
const cors = require('cors')

const { v4: uuidv4 } = require('uuid')

const app = express()

app.use(cors())
app.use(express.json())

const users = []

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers

  const user = users.find(user => user.username === username)

  if (!user) {
    response.status(404).json({ error: 'User not found!'})
  }

  request.user = user

  return next()
}

app.post('/users', (request, response) => {
  const { name, username } = request.body
  const usernameAlreadyExists = users.find(user => user.username === username)

  if (usernameAlreadyExists) {
    response.status(400).json({ error: 'O usuario já existe.'})
  } else {
    const user = {
      id: uuidv4(),
      name,
      username,
      todos: []
    }
  
    users.push(user)
    return response.status(201).json(user)
  }
})

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request

  return response.json(user.todos)
})

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body
  const { user } = request
 
  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }
 
  user.todos.push(todo)
 
  return response.status(201).json(todo)
})

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body
  const { user } = request
  const { id } = request.params

  const todo = user.todos.find(user => user.id === id)

  if (todo) {
    todo.title = title
    todo.deadline = new Date(deadline)
    
    return response.json(todo)
  } 
  return response.status(404).json({ error: 'Todo not found!'})

})

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id }  = request.params
  const { user } = request

  const todo = user.todos.find(u => u.id === id)

  if(!todo) {
    response.status(404).json({ error: 'id não encontrado'})
  } 
  todo.done = true

  response.json(todo)
})

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params
  const { user } = request

  const deleteUser = user.todos.findIndex(user => user.id === id)
  if (deleteUser === -1) return response.status(404).json({ error: 'User not found!'})
  user.todos.splice(deleteUser, 1)
  response.status(204).json()
})

module.exports = app