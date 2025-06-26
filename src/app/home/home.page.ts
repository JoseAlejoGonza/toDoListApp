import { Component, OnInit } from '@angular/core';
import { Category } from '../models/category.model';
import { Task } from '../models/task.model';
import { AlertController, ModalController } from '@ionic/angular';
import { Router } from '@angular/router';
import { CategoryService } from '../services/category.service';
import { TaskService } from '../services/task.service';
import { ModalSelectCategoryComponent } from '../components/modal-select-category/modal-select-category.component';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit{

  tasks: Task[] = [];
  categories: Category[] = [];
  newTask = '';
  selectedCategoryId: number | null = null;

  constructor(
    private taskService: TaskService,
    private categoryService: CategoryService,
    private router: Router,
    private modalController: ModalController,
    private alertController: AlertController
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    this.tasks = this.taskService.getTasks();
    this.categories = this.categoryService.getCategories();
  }

  async addTask() {
    if (!this.newTask.trim()) return;

    const modal = await this.modalController.create({
      component: ModalSelectCategoryComponent,
      componentProps: {
        categories: this.categories
      }
    });

    await modal.present();
    const { data: selectedCategoryId } = await modal.onDidDismiss();

    if (selectedCategoryId === undefined) return;

    this.taskService.addTask({
      id: Date.now(),
      title: this.newTask,
      completed: false,
      categoryId: selectedCategoryId || undefined
    });

    const selectedCategory = this.categories.find(c => c.id === selectedCategoryId);
    await this.showTaskCreatedAlert(selectedCategory?.name || null);

    this.newTask = '';
    this.loadData();
  }

  toggleComplete(task: Task) {
    task.completed = !task.completed;
    this.taskService.updateTask(task);
    this.loadData();
  }

  deleteTask(id: number) {
    this.taskService.deleteTask(id);
    this.loadData();
  }

  filterByCategory(categoryId: number | null) {
    this.selectedCategoryId = categoryId;
    this.loadData();
  }

  get filteredTasks(): Task[] {
    if (this.selectedCategoryId === -1) return this.tasks;
    if (this.selectedCategoryId === null) return this.tasks.filter(t => !t.categoryId);
    return this.tasks.filter(t => t.categoryId === this.selectedCategoryId);
  }

  async showTaskCreatedAlert(categoryName: string | null) {
    const alert = await this.alertController.create({
      header: 'Tarea creada',
      message: `La tarea fue creada y asociada a la categoría ${categoryName || 'Sin categoría'}.`,
      buttons: ['OK']
    });

    await alert.present();
  }

  goToCategories() {
    this.router.navigate(['/categories']);
  }
}
