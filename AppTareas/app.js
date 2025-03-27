document.addEventListener('DOMContentLoaded', async () => {
    // *** CONFIGURACIÓN DE SUPABASE ***
    const supabaseUrl = 'https://rinlymrxxvfzrtxihwfc.supabase.co';
    const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJpbmx5bXJ4eHZmenJ0eGlod2ZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI2NzY1MzcsImV4cCI6MjA1ODI1MjUzN30.jWgIAcyFJ2cflaj-5vpwvzxQQ89ooCfekLRHtJiod9I';
    const supabase = window.supabase.createClient(supabaseUrl, supabaseAnonKey);
    // *******************************************************************************

    // Elementos del DOM
    const botonNuevaTarea = document.getElementById('botonNuevaTarea');
    const formularioNuevaTarea = document.getElementById('formularioNuevaTarea');
    const formularioTarea = document.getElementById('formularioTarea');
    const botonCerrarFormulario = document.getElementById('botonCerrarFormulario');
    const listadoTareas = document.getElementById('listadoTareas');
    const filtroTodas = document.querySelector('input[value="todas"]');
    const filtroNoCompletadas = document.querySelector('input[value="noCompletadas"]');
    const selectCategoriaFormulario = document.getElementById('categoria');

    let tareas = [];
    let formularioVisible = false;
    let filtroActivo = 'todas';
    let categorias = [];

    // *** FUNCIONES PARA INTERACTUAR CON SUPABASE ***

    async function cargarCategorias() {
        try {
            const { data, error } = await supabase
              .from('categorias')
              .select('id, nombre');

            if (error) {
                console.error('Error al cargar categorías:', error);
            } else {
                categorias = data;
                categorias.forEach(categoria => {
                    const opcion = document.createElement('option');
                    opcion.value = categoria.id;
                    opcion.textContent = categoria.nombre;
                    selectCategoriaFormulario.appendChild(opcion);
                });
                console.log('Categorías cargadas:', categorias);
            }
        } catch (error) {
            console.error('Error al cargar categorías:', error);
        }
    }

    async function cargarTareas() {
        try {
            const { data: tareasObtenidas, error } = await supabase
              .from('tareas')
              .select('*')
              .order('fecha', { ascending: false })
              .order('hora', { ascending: false });

            if (error) {
                console.error('Error al cargar tareas:', error);
            } else {
                tareas = tareasObtenidas;
                mostrarTareas(tareas);
            }
        } catch (error) {
            console.error('Error al cargar tareas:', error);
        }
    }

    async function guardarTarea(tarea) {
        try {
            const { error } = await supabase
              .from('tareas')
              .insert([tarea]);

            if (error) {
                console.error('Error al guardar tarea:', error);
            } else {
                cargarTareas();
            }
        } catch (error) {
            console.error('Error al guardar tarea:', error);
        }
    }

    async function actualizarTarea(id, datosActualizados) {
        try {
            const { error } = await supabase
              .from('tareas')
              .update(datosActualizados)
              .eq('id', id);

            if (error) {
                console.error('Error al actualizar tarea:', error);
            } else {
                cargarTareas();
            }
        } catch (error) {
            console.error('Error al actualizar tarea:', error);
        }
    }

    async function borrarTarea(id) {
        try {
            const { error } = await supabase
              .from('tareas')
              .delete()
              .eq('id', id);

            if (error) {
                console.error('Error al borrar tarea:', error);
            } else {
                cargarTareas();
            }
        } catch (error) {
            console.error('Error al borrar tarea:', error);
        }
    }

    async function marcarComoCompletada(idTarea, completada) {
        try {
            const { error } = await supabase
              .from('tareas')
              .update({ completada: completada })
              .eq('id', idTarea);

            if (error) {
                console.error('Error al marcar como completada:', error);
            } else {
                cargarTareas();
            }
        } catch (error) {
            console.error('Error al marcar como completada:', error);
        }
    }

    // *** FUNCIONES PARA MANEJAR LA INTERFAZ DE USUARIO ***

    function mostrarFormularioTarea() {
        formularioNuevaTarea.classList.remove('oculto');
        botonNuevaTarea.textContent = '✖ Cerrar';
        formularioVisible = true;
    }

    function ocultarFormularioTarea() {
        formularioNuevaTarea.classList.add('oculto');
        botonNuevaTarea.textContent = '➕ Nueva tarea';
        formularioVisible = false;
        formularioTarea.reset(); // Limpiar el formulario
    }

    function mostrarTareas(tareasParaMostrar) {
        listadoTareas.innerHTML = ''; // Limpiar el listado actual

        const tareasFiltradas = tareasParaMostrar.filter(tarea => {
            if (filtroActivo === 'noCompletadas') {
                return !tarea.completada;
            }
            return true; // Mostrar todas las tareas si el filtro es 'todas'
        });

        if (tareasFiltradas.length === 0) {
            listadoTareas.innerHTML = '<p>No hay tareas para mostrar con el filtro actual.</p>';
            return;
        }

        tareasFiltradas.forEach(tarea => {
            const tareaDiv = document.createElement('div');
            tareaDiv.classList.add('tarea');
            if (tarea.completada) {
                tareaDiv.classList.add('completada');
            }
            tareaDiv.dataset.id = tarea.id; // Almacenar el ID de la tarea en el elemento

            const tituloTarea = document.createElement('h3');
            tituloTarea.classList.add('tarea-titulo');
            tituloTarea.textContent = tarea.titulo;

            const descripcionTarea = document.createElement('p');
            descripcionTarea.classList.add('tarea-descripcion');
            descripcionTarea.textContent = tarea.descripcion || '';

            const fechaHoraTarea = document.createElement('p');
            fechaHoraTarea.classList.add('tarea-fecha-hora');
            const fecha = new Date(tarea.fecha);
            const hora = tarea.hora;
            fechaHoraTarea.textContent = `📅 ${fecha.toLocaleDateString()} ⏰ ${hora}`;

            const prioridadTarea = document.createElement('p');
            prioridadTarea.classList.add('tarea-prioridad');
            prioridadTarea.textContent = '⭐'.repeat(tarea.prioridad);

            const categoriaTarea = document.createElement('p');
            categoriaTarea.classList.add('tarea-categoria');
            const categoriaEncontrada = obtenerNombreCategoria(tarea.id_categoria);
            categoriaTarea.textContent = `🏷️ ${categoriaEncontrada || '(Sin categoría)'}`;

            const botonesTarea = document.createElement('div');
            botonesTarea.classList.add('tarea-botones');

            const botonCompletar = document.createElement('button');
            botonCompletar.textContent = tarea.completada ? '✅ Completada' : '✅ Marcar como completada';
            botonCompletar.addEventListener('click', () => marcarComoCompletada(tarea.id, !tarea.completada));

            const botonEditar = document.createElement('button');
            botonEditar.textContent = '✏️ Editar';
            botonEditar.addEventListener('click', () => mostrarFormularioEdicion(tarea));

            const botonBorrar = document.createElement('button');
            botonBorrar.textContent = '🗑️ Borrar';
            botonBorrar.addEventListener('click', () => borrarTarea(tarea.id));

            botonesTarea.appendChild(botonCompletar);
            botonesTarea.appendChild(botonEditar);
            botonesTarea.appendChild(botonBorrar);

            tareaDiv.appendChild(tituloTarea);
            if (tarea.descripcion) {
                tareaDiv.appendChild(descripcionTarea);
            }
            tareaDiv.appendChild(fechaHoraTarea);
            tareaDiv.appendChild(prioridadTarea);
            tareaDiv.appendChild(categoriaTarea);
            tareaDiv.appendChild(botonesTarea);

            listadoTareas.appendChild(tareaDiv);
        });
    }

    function mostrarFormularioEdicion(tarea) {
        const tareaDiv = document.querySelector(`.tarea[data-id="${tarea.id}"]`);
        if (!tareaDiv) return;

        const formularioEdicion = document.createElement('form');
        formularioEdicion.classList.add('formulario-edicion');
        formularioEdicion.dataset.id = tarea.id;

        formularioEdicion.innerHTML = `
            <div>
                <label for="editar-titulo-${tarea.id}">Título:</label>
                <input type="text" id="editar-titulo-${tarea.id}" name="titulo" value="${tarea.titulo}" required>
            </div>
            <div>
                <label for="editar-descripcion-${tarea.id}">Descripción:</label>
                <textarea id="editar-descripcion-${tarea.id}" name="descripcion">${tarea.descripcion || ''}</textarea>
            </div>
            <div>
                <label for="editar-fecha-${tarea.id}">Fecha y hora:</label>
                <input type="datetime-local" id="editar-fecha-${tarea.id}" name="fecha" value="${tarea.fecha ? tarea.fecha + 'T' + tarea.hora : ''}">
            </div>
            <div>
                <label for="editar-prioridad-${tarea.id}">Prioridad (1–3):</label>
                <select id="editar-prioridad-${tarea.id}" name="prioridad">
                    <option value="1" ${tarea.prioridad === 1 ? 'selected' : ''}>⭐</option>
                    <option value="2" ${tarea.prioridad === 2 ? 'selected' : ''}>⭐⭐</option>
                    <option value="3" ${tarea.prioridad === 3 ? 'selected' : ''}>⭐⭐⭐</option>
                </select>
            </div>
            <div>
                <label for="editar-categoria-${tarea.id}">Categoría:</label>
                <select id="editar-categoria-${tarea.id}" name="categoria">
                    <option value="">(Sin categoría)</option>
                    ${obtenerOpcionesCategorias(tarea.id_categoria)}
                </select>
            </div>
            <button type="submit">Guardar Cambios</button>
            <button type="button" class="boton-cancelar-edicion">Cancelar</button>
        `;

        tareaDiv.appendChild(formularioEdicion);

        formularioEdicion.addEventListener('submit', async (evento) => { // Añade 'async'
            evento.preventDefault();
            const idTarea = evento.target.dataset.id;
            const titulo = document.getElementById(`editar-titulo-${idTarea}`).value;
            const descripcion = document.getElementById(`editar-descripcion-${idTarea}`).value;
            const fechaHora = document.getElementById(`editar-fecha-${idTarea}`).value;
            const prioridad = parseInt(document.getElementById(`editar-prioridad-${idTarea}`).value);
            const categoria = document.getElementById(`editar-categoria-${idTarea}`).value;

            const fecha = fechaHora ? fechaHora.split('T')[0] : null;
            const hora = fechaHora ? fechaHora.split('T')[1] : null;

            const datosActualizados = {
                titulo: titulo,
                descripcion: descripcion,
                fecha: fecha,
                hora: hora,
                prioridad: prioridad,
                id_categoria: categoria || null
            };
            await actualizarTarea(idTarea, datosActualizados); // Añade 'await'
        });

        const botonCancelar = formularioEdicion.querySelector('.boton-cancelar-edicion');
        botonCancelar.addEventListener('click', () => {
            tareaDiv.removeChild(formularioEdicion);
        });
    }

    function obtenerOpcionesCategorias(categoriaSeleccionadaId) {
        let opcionesHTML = '';
        if (typeof categorias !== 'undefined') {
            categorias.forEach(categoria => {
                opcionesHTML += `<option value="${categoria.id}" ${categoria.id === categoriaSeleccionadaId ? 'selected' : ''}>${categoria.nombre}</option>`;
            });
        }
        return opcionesHTML;
    }

    function obtenerNombreCategoria(idCategoria) {
        if (typeof categorias !== 'undefined') {
            const categoria = categorias.find(cat => cat.id === idCategoria);
            return categoria ? categoria.nombre : null;
        }
        return null;
    }

    // *** EVENT LISTENERS ***
    botonNuevaTarea.addEventListener('click', () => {
        if (formularioVisible) {
            ocultarFormularioTarea();
        } else {
            mostrarFormularioTarea();
        }
    });

    botonCerrarFormulario.addEventListener('click', ocultarFormularioTarea);

    formularioTarea.addEventListener('submit', async (evento) => { // Añade 'async'
        evento.preventDefault();
        const titulo = document.getElementById('titulo').value;
        const descripcion = document.getElementById('descripcion').value;
        const fechaHora = document.getElementById('fecha').value;
        const prioridad = parseInt(document.getElementById('prioridad').value);
        const categoria = document.getElementById('categoria').value;

        const fecha = fechaHora ? fechaHora.split('T')[0] : null;
        const hora = fechaHora ? fechaHora.split('T')[1] : null;

        const nuevaTarea = {
            id: crypto.randomUUID(),
            titulo: titulo,
            descripcion: descripcion,
            fecha: fecha,
            hora: hora,
            prioridad: prioridad,
            completada: false,
            id_categoria: categoria || null
        };

        await guardarTarea(nuevaTarea); // Añade 'await'
        ocultarFormularioTarea();
    });

    filtroTodas.addEventListener('change', () => {
        filtroActivo = 'todas';
        mostrarTareas(tareas);
    });

    filtroNoCompletadas.addEventListener('change', () => {
        filtroActivo = 'noCompletadas';
        mostrarTareas(tareas);
    });

    // *** INICIALIZACIÓN ***
    await cargarCategorias(); // Espera a que las categorías se carguen
    cargarTareas(); // Luego carga las tareas
});