// 🔑 Sustituye con tu URL y anonKey de Supabase
const supabaseUrl = 'https://rinlymrxxvfzrtxihwfc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJpbmx5bXJ4eHZmenJ0eGlod2ZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI2NzY1MzcsImV4cCI6MjA1ODI1MjUzN30.jWgIAcyFJ2cflaj-5vpwvzxQQ89ooCfekLRHtJiod9I';
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const taskList = document.getElementById('task-list');

// Leer tareas al cargar la página
document.addEventListener('DOMContentLoaded', fetchTasks);

// Añadir tarea
taskForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const taskText = taskInput.value.trim();
  if (taskText === '') return;
  await supabase.from('todos').insert([{ task: taskText }]);
  taskInput.value = '';
  fetchTasks();
});

// Mostrar tareas
async function fetchTasks() {
  const { data: tasks, error } = await supabase
    .from('todos')
    .select('*')
    .order('created_at', { ascending: true });

  taskList.innerHTML = '';
  tasks.forEach(task => {
    const li = document.createElement('li');
    li.innerHTML = `
      <span>${task.task}</span>
      <div>
        <button onclick="editTask(${task.id}, '${task.task.replace(/'/g, "\\'")}')">✏️</button>
        <button onclick="deleteTask(${task.id})">🗑️</button>
      </div>
    `;
    taskList.appendChild(li);
  });
}

// Editar tarea
async function editTask(id, oldText) {
  const newText = prompt('Editar tarea:', oldText);
  if (newText && newText.trim() !== '') {
    await supabase.from('todos').update({ task: newText }).eq('id', id);
    fetchTasks();
  }
}

// Borrar tarea
async function deleteTask(id) {
  await supabase.from('todos').delete().eq('id', id);
  fetchTasks();
}
