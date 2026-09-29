// Un <div> con onClick no es enfocable ni responde al teclado: quien navega con
// tabulador, o usa un lector de pantalla, no puede activarlo. Este helper
// devuelve un onKeyDown que ejecuta la misma accion del onClick al pulsar Enter
// o Espacio, que es lo que espera el patron WAI-ARIA de button.
export function alPulsarEnterOEspacio(accion) {
  return (evento) => {
    if (evento.key === "Enter" || evento.key === " " || evento.key === "Spacebar") {
      // Sin esto, Espacio tambien desplaza la pagina y Enter puede recargar.
      evento.preventDefault();
      accion(evento);
    }
  };
}
