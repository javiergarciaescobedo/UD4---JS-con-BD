// 🔑 Sustituye con tu URL y anonKey de Supabase
const supabaseUrl = 'https://rinlymrxxvfzrtxihwfc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJpbmx5bXJ4eHZmenJ0eGlod2ZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI2NzY1MzcsImV4cCI6MjA1ODI1MjUzN30.jWgIAcyFJ2cflaj-5vpwvzxQQ89ooCfekLRHtJiod9I';

const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);


const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const taskList = document.getElementById('task-list');

// Leer tareas al cargar la página
document.addEventListener('DOMContentLoaded', () => {
  fetchTasks();
  loadCategories();
});

// Mostrar/ocultar formulario
const showFormBtn = document.getElementById('show-form-btn');
const formContainer = document.getElementById('form-container');
showFormBtn.addEventListener('click', () => {
  formContainer.style.display = formContainer.style.display === 'none' ? 'block' : 'none';
});

// Cargar categorías desde Supabase
async function loadCategories() {
  const { data, error } = await supabase.from('categories').select('*');
  const categorySelect = document.getElementById('task-category');
  if (data) {
    data.forEach(cat => {
      const option = document.createElement('option');
      option.value = cat.id;
      option.textContent = cat.name;
      categorySelect.appendChild(option);
    });
  }
}

// Filtrado por tareas completadas
document.getElementById('filter-tasks').addEventListener('change', fetchTasks);


taskForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('task-title').value.trim();
    const description = document.getElementById('task-description').value.trim();
    const dueDate = document.getElementById('task-date').value;
    const dueTime = document.getElementById('task-time').value;
    const priority = parseInt(document.getElementById('task-priority').value);

    if (title === '') return;

    await supabase.from('todos').insert([{
        task: title,
        description,
        due_date: dueDate || null,
        due_time: dueTime || null,
        is_complete: false,
        priority: priority
    }]);

    // Limpiar el formulario
    taskForm.reset();
    fetchTasks();
});

// Mostrar tareas
async function fetchTasks() {
  const filter = document.getElementById('filter-tasks')?.value;
  let query = supabase.from('todos').select('*').order('created_at', { ascending: true });
  if (filter === 'pending') query = query.eq('is_complete', false);

  const { data: tasks, error } = await query;

  taskList.innerHTML = '';
  tasks.forEach(task => {
    const li = document.createElement('li');
    li.className = 'task-item';
    li.dataset.id = task.id;
    
    // Zona izquierda (info)
    const infoDiv = document.createElement('div');
    infoDiv.className = 'task-info';
    
    // Título
    const taskText = document.createElement('h3');
    taskText.textContent = task.task;
    if (task.is_complete) {
      taskText.style.textDecoration = 'line-through';
      taskText.style.color = '#888';
    }
    infoDiv.appendChild(taskText);
    
    // Descripción
    if (task.description) {
      const desc = document.createElement('p');
      desc.textContent = task.description;
      infoDiv.appendChild(desc);
    }
    
    // Fecha y hora
    if (task.due_date || task.due_time) {
      const fecha = document.createElement('p');
      fecha.innerHTML = `${task.due_date ? '📅 ' + formatDate(task.due_date) : ''} ${task.due_time ? '⏰ ' + task.due_time : ''}`;
      infoDiv.appendChild(fecha);
    }
    
    // Prioridad
    const prioridad = document.createElement('p');
    prioridad.innerHTML = `🔵 Prioridad: ${'⭐'.repeat(task.priority || 1)}`;
    infoDiv.appendChild(prioridad);
    
    li.appendChild(infoDiv);
    
    // Zona derecha (botones)
    const btns = document.createElement('div');
    btns.className = 'task-buttons';
    
    // ✅ toggle
    const toggleBtn = document.createElement('button');
    toggleBtn.textContent = task.is_complete ? '✅' : '⬜️';
    toggleBtn.addEventListener('click', () => toggleComplete(task.id, !task.is_complete));
    btns.appendChild(toggleBtn);
    
    // ✏️ editar
    const editBtn = document.createElement('button');
    editBtn.textContent = '✏️';
    editBtn.addEventListener('click', () => editTask(task.id, task.task));
    btns.appendChild(editBtn);
    
    // 🗑️ borrar
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = '🗑️';
    deleteBtn.addEventListener('click', () => deleteTask(task.id));
    btns.appendChild(deleteBtn);
    
    li.appendChild(btns);
    taskList.appendChild(li);    
  });
}

async function editTask(id) {
    const { data: taskData, error } = await supabase
      .from('todos')
      .select('*')
      .eq('id', id)
      .single();
  
    if (error) {
      alert('No se pudo cargar la tarea');
      return;
    }
  
    const li = [...document.querySelectorAll('.task-item')]
      .find(el => el.dataset.id === String(id));
  
    if (!li) return;
  
    // Vaciar contenido y reemplazar por formulario
    li.innerHTML = '';
  
    const form = document.createElement('form');
    form.classList.add('edit-form');
  
    form.innerHTML = `
      <input type="text" name="task" value="${taskData.task}" required />
      <textarea name="description" placeholder="Descripción">${taskData.description || ''}</textarea>
      <input type="date" name="due_date" value="${taskData.due_date || ''}" />
      <input type="time" name="due_time" value="${taskData.due_time || ''}" />
      <select name="priority">
        <option value="1" ${taskData.priority == 1 ? 'selected' : ''}>⭐ (Baja)</option>
        <option value="2" ${taskData.priority == 2 ? 'selected' : ''}>⭐⭐ (Media)</option>
        <option value="3" ${taskData.priority == 3 ? 'selected' : ''}>⭐⭐⭐ (Alta)</option>
      </select>
      <div class="edit-actions">
        <button type="submit">💾 Guardar</button>
        <button type="button" class="cancel-btn">❌ Cancelar</button>
      </div>
    `;
  
    // Guardar cambios
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      await supabase.from('todos').update({
        task: formData.get('task'),
        description: formData.get('description'),
        due_date: formData.get('due_date') || null,
        due_time: formData.get('due_time') || null,
        priority: parseInt(formData.get('priority')) || 1
      }).eq('id', id);
      fetchTasks();
    });
  
    // Cancelar
    form.querySelector('.cancel-btn').addEventListener('click', () => {
      fetchTasks();
    });
  
    li.appendChild(form);
}
  


// Borrar tarea
async function deleteTask(id) {
  await supabase.from('todos').delete().eq('id', id);
  fetchTasks();
}

async function toggleComplete(id, newStatus) {
    await supabase.from('todos')
      .update({ is_complete: newStatus })
      .eq('id', id);
    fetchTasks();
  }

  function formatDate(dateString) {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString(); // sin idioma = usa el del sistema
  }
  