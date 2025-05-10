import { Component, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"
import { MatInputModule } from "@angular/material/input"
import { MatButtonModule } from "@angular/material/button"
import { MatCheckboxModule } from "@angular/material/checkbox"
import { MatCardModule } from "@angular/material/card"
import { MatIconModule } from "@angular/material/icon"
import { TodoService } from "../todo.service"
import type { Todo } from "../todo.model"

@Component({
  selector: "app-todo",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
    MatCardModule,
    MatIconModule,
  ],
  templateUrl: "./todo.component.html",
  styleUrls: ["./todo.component.css"],
})
export class TodoComponent implements OnInit {
  todos: Todo[] = []
  filteredTodos: Todo[] = []
  newTodoTitle = ""
  searchQuery = ""
  editingId: number | null = null
  editText = ""

  constructor(private todoService: TodoService) {}

  ngOnInit(): void {
    this.todoService.getTodos().subscribe((data) => {
      this.todos = data.slice(0, 10)
      this.filteredTodos = [...this.todos]
    })
  }

  addTodo() {
    if (!this.newTodoTitle.trim()) return

    const todo: Partial<Todo> = {
      userId: 1,
      title: this.newTodoTitle,
      completed: false,
    }

    this.todoService.addTodo(todo).subscribe((created) => {
      this.todos.unshift(created)
      this.filteredTodos = [...this.todos]
      this.newTodoTitle = ""
    })
  }

  updateTodo(todo: Todo) {
    this.todoService.updateTodo(todo.id, todo).subscribe(() => {
      this.filterTodos()
    })
  }

  deleteTodo(id: number) {
    this.todoService.deleteTodo(id).subscribe(() => {
      this.todos = this.todos.filter((t) => t.id !== id)
      this.filteredTodos = [...this.todos]
    })
  }

  startEditing(todo: Todo) {
    this.editingId = todo.id
    this.editText = todo.title
  }

  saveEdit(id: number) {
    if (!this.editText.trim()) return

    const todoToUpdate = this.todos.find((t) => t.id === id)
    if (todoToUpdate) {
      const updated = { ...todoToUpdate, title: this.editText }
      this.todoService.updateTodo(id, updated).subscribe(() => {
        const index = this.todos.findIndex((t) => t.id === id)
        if (index !== -1) {
          this.todos[index] = { ...this.todos[index], title: this.editText }
          this.filteredTodos = [...this.todos]
        }
        this.editingId = null
      })
    }
  }

  cancelEdit() {
    this.editingId = null
  }

  search() {
    this.filterTodos()
  }

  filterTodos() {
    if (!this.searchQuery.trim()) {
      this.filteredTodos = [...this.todos]
    } else {
      this.filteredTodos = this.todos.filter((todo) =>
        todo.title.toLowerCase().includes(this.searchQuery.toLowerCase()),
      )
    }
  }

  clearCompleted() {
    const incompleteTodos = this.todos.filter((todo) => !todo.completed)
    this.todos = incompleteTodos
    this.filteredTodos = [...this.todos]
  }
}
