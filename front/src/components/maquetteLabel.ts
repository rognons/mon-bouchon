// MAQUETTE (non poussée sur preview-2) : la variante lue dans l'adresse.
export const variante =
  typeof location !== 'undefined' ? (new URLSearchParams(location.search).get('ideal') ?? '') : '';
