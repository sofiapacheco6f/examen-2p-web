const express = require('express');
const fs = require('fs');

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.static('.'));

let cabeza = null;

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
            return res.redirect('/actualizar.html?resultado=ok');
        }
        actual = actual.siguiente;
    }

    res.redirect('/actualizar.html?resultado=noencontrada');
});

app.listen(3000, () => console.log('Servidor en http://localhost:3000'));