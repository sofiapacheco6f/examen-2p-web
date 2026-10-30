const express = require('express');
const fs = require('fs');

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.static('.'));

let cabeza = null;
//agrega los datos
function agregar(datos) {
    const nuevo = { datos: datos, siguiente: null };

    if (cabeza === null) {
        cabeza = nuevo;
        return;
    }

    let actual = cabeza;
    while (actual.siguiente !== null) {
        actual = actual.siguiente;
    }
    actual.siguiente = nuevo;
}
//guarda info
function guardar() {
    let texto = '';
    let actual = cabeza;

    while (actual !== null) {
        const a = actual.datos;
        texto += a.nombre + ' | ' + a.correo + ' | ' + a.actividad + ' | ' + a.estado + '\n';
        actual = actual.siguiente;
    }

    fs.writeFileSync('actividades.txt', texto);
}

if (fs.existsSync('actividades.txt')) {
    const lineas = fs.readFileSync('actividades.txt', 'utf8').split('\n');

    for (const linea of lineas) {
        if (linea.trim() === '') {
            continue;
        }
        const p = linea.split(' | ');
        agregar({ nombre: p[0], correo: p[1], actividad: p[2], estado: p[3] });
    }
}
//para registrar la act
app.post('/registrar', (req, res) => {
    const a = req.body;

    agregar({
        nombre: a.nombre,
        correo: a.correo,
        actividad: a.actividad,
        estado: a.estado
    });
    guardar();

    res.send('<h1>¡Actividad registrada con éxito!</h1><a href="/examen2p.html">Volver al formulario</a>');
});
//por si esta vacio
app.post('/actualizar', (req, res) => {
    const nombre = req.body.nombre;
    const actividad = req.body.actividad;
    const estado = req.body.estado;

    if (!nombre || !nombre.trim() || !actividad || !actividad.trim()) {
        return res.status(400).send('Faltan datos');
    }

    let actual = cabeza;

    while (actual !== null) {
        const mismoNombre = actual.datos.nombre.toLowerCase() === nombre.trim().toLowerCase();
        const mismaActividad = actual.datos.actividad.toLowerCase() === actividad.trim().toLowerCase();

        if (mismoNombre && mismaActividad) {
            actual.datos.estado = estado;
            guardar();
            return res.redirect('/actualizar.html?resultado=ok'); //si encontro act
        }
        actual = actual.siguiente;
    }

    res.redirect('/actualizar.html?resultado=noencontrada'); //no encontro act
});

// consultar: recorre la lista nodo por nodo y arma una fila de la tabla por cada actividad
app.get('/consultar', (req, res) => {
    let filas = '';
    let actual = cabeza;

    while (actual !== null) {
        const a = actual.datos;
        filas += '<tr>';
        filas += '<td>' + a.nombre + '</td>';
        filas += '<td>' + a.correo + '</td>';
        filas += '<td>' + a.actividad + '</td>';
        filas += '<td>' + a.estado + '</td>';
        filas += '</tr>';
        actual = actual.siguiente;
    }

    // si la lista esta vacia, avisa que no hay nada
    if (filas === '') {
        filas = '<tr><td colspan="4">No hay actividades registradas</td></tr>';
    }

    // manda la pagina completa con la tabla
    res.send(
        '<!DOCTYPE html>' +
        '<html lang="es"><head><meta charset="UTF-8">' +
        '<title>Consultar actividades</title>' +
        '<link rel="stylesheet" href="examen2p.css"></head>' +
        '<body>' +
        '<header id="encabezado"><h1 id="titulo">CONTAPC</h1>' +
        '<div id="inicio"><h3>Actividades registradas</h3></div></header>' +
        '<table>' +
        '<tr><th>Nombre</th><th>Correo</th><th>Actividad</th><th>Estado</th></tr>' +
        filas +
        '</table>' +
        '<p style="text-align:center">' +
        '<a href="/examen2p.html">Registrar</a> | <a href="/actualizar.html">Actualizar</a>' +
        '</p>' +
        '</body></html>'
    );
});

app.listen(3000, () => console.log('Servidor en http://localhost:3000')); //confirma q esta prendido