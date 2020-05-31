let DB;

// selecctores de la interfaz
const form = document.querySelector("form"),
  nombreMascota = document.querySelector("#mascota"),
  nombreCliente = document.querySelector("#cliente"),
  telefono = document.querySelector("#telefono"),
  fecha = document.querySelector("#fecha"),
  hora = document.querySelector("#hora"),
  sintomas = document.querySelector("#sintomas"),
  citas = document.querySelector("#citas"),
  HeadingAdministra = document.querySelector("#administra");

// Esperar por el DOM Ready
document.addEventListener("DOMContentLoaded", () => {
  // crear la base de datos
  let crearDB = window.indexedDB.open("citas", 1);

  // si hay un error enviarlo a la consola
  crearDB.onerror = function () {
    console.log("Hubo un error");
  };

  // si todo esta bien entonces nuesta en consola , y asignar la base de datos
  crearDB.onsuccess = function () {
    // console.log('Todo listo!!');

    // asiganr a la base de datos
    DB = crearDB.result;
    // console.log(DB);

    mostrarCitas();
  };

  // este metodo solo corre una sola vez y es ideal para crear el Schema
  crearDB.onupgradeneeded = function (e) {
    // el evento es la misma base de datos 
    let db = e.target.result;

    // definir el objetStore, toma 2 parametros el nombre de la base de datos y segundo las opciones
    // keyPath es el indice de la base de datos
    let objectStore = db.createObjectStore('citas', { keyPath: 'Key', autoIncrement: true });

    // Crear los indeces y campos de la base de datos, createIndex: 3 parametros, nombre, keypath y opciones
    objectStore.createIndex('mascota', 'mascota', { unique: false });
    objectStore.createIndex('cliente', 'cliente', { unique: false });
    objectStore.createIndex('telefono', 'telefono', { unique: false });
    objectStore.createIndex('fecha', 'fecha', { unique: false });
    objectStore.createIndex('hora', 'hora', { unique: false });
    objectStore.createIndex('sintomas', 'sintomas', { unique: false });

  };

  // cuando el formulario se envia
  form.addEventListener('submit', agregarDatos);

  function agregarDatos(e) {
    e.preventDefault();

    const nuevaCita = {
      mascota: nombreMascota.value,
      cliente: nombreCliente.value,
      telefono: telefono.value,
      fecha: fecha.value,
      hora: hora.value,
      sintomas: sintomas.value
    }
    // console.log(nuevaCita);

    // IndexDB se utilizan  las transacciones
    let transaction = DB.transaction(['citas'], 'readwrite');
    let objectStore = transaction.objectStore('citas');
    // console.log(objectStore);

    let peticion = objectStore.add(nuevaCita);

    console.log(peticion);

    peticion.onsuccess = () => {
      form.reset();
    }
    transaction.oncomplete = () => {
      console.log('Cita agregada');
      mostrarCitas();
    }
    transaction.onerror = () => {
      console.log('Hubo un error!');
    }
  }

  function mostrarCitas() {
    // limpiar las citas anteriores
    while (citas.firstChild) {
      citas.removeChild(citas.firstChild);
    }

    // creamos un objectStore
    let objectStore = DB.transaction('citas').objectStore('citas');

    // esto retorna un peticion
    objectStore.openCursor().onsuccess = function (e) {
      // cursor se va a ubicar en el registro indicado para acceder a los datos
      let cursor = e.target.result;

      if (cursor) {
        let citaHTMl = document.createElement('li');
        citaHTMl.setAttribute('data-cita-id', cursor.key);
        citaHTMl.classList.add('list-group-item');

        citaHTMl.innerHTML = `
          <p class="font-weight-bold">Mascota:
            <span class="font-weight-normal">
              ${cursor.value.mascota}
            </span>
          </p>

          <p class="font-weight-bold">Dueño:
            <span class="font-weight-normal">
              ${cursor.value.cliente}
            </span>
          </p>

          <p class="font-weight-bold">Fecha:
            <span class="font-weight-normal">
              ${cursor.value.fecha}
            </span>
          </p>

          <p class="font-weight-bold">Hora:
            <span class="font-weight-normal">
              ${cursor.value.hora}
            </span>
          </p>

          <p class="font-weight-bold">Sintomas:
            <span class="font-weight-normal">
              ${cursor.value.sintomas}
            </span>
          </p>
        `;

        // boton de borrar
        const botonBorrar = document.createElement('button');
        botonBorrar.classList.add('borrar', 'btn', 'btn-danger');
        botonBorrar.innerHTML = '<span aria-hidden="true">x</span> Borrar';
        botonBorrar.onclick = borrarCita;
        citaHTMl.appendChild(botonBorrar);

        // append en el padre
        citas.appendChild(citaHTMl);
        // consultar los proximos registros
        cursor.continue();
      } else {
        if (!citas.firstChild) {
          // cuando no hay registros
          HeadingAdministra.textContent = 'Agrega citas para comenzar';
          let listado = document.createElement('p');
          listado.classList.add('text-center');
          listado.textContent = 'No hay registros';
          citas.appendChild(listado);
        } else {
          HeadingAdministra.textContent = 'Administra tus citas'
        }
      }
    }
  }

  function borrarCita(e) {
    let citaID = Number(e.target.parentElement.getAttribute('data-cita-id'));

    // IndexDB se utilizan  las transacciones
    let transaction = DB.transaction(['citas'], 'readwrite');
    let objectStore = transaction.objectStore('citas');

    let peticion = objectStore.delete(citaID);

    transaction.oncomplete = () => {
      e.target.parentElement.parentElement.removeChild(e.target.parentElement);

      console.log(`Se elimino la cita con el ID: ${citaID}`);
      if (!citas.firstChild) {
        // cuando no hay registros
        HeadingAdministra.textContent = 'Agrega citas para comenzar';
        let listado = document.createElement('p');
        listado.classList.add('text-center');
        listado.textContent = 'No hay registros';
        citas.appendChild(listado);
      } else {
        HeadingAdministra.textContent = 'Administra tus citas'
      }

    }

  }

});
