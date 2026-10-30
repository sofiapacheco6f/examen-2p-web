document.querySelector('#formulario').addEventListener('submit', function (e) {
    const f = new FormData(this);
    //por si esta vacio
    if (f.get('nombre').trim() === '' || f.get('correo').trim() === '' || f.get('actividad').trim() === '') {
        e.preventDefault();
        alert('Llena todos los campos');
        return;
    }

    alert('Registrando la actividad de ' + f.get('nombre')); //confirma que si fue llenado
});