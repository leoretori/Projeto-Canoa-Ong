/**
 * Informações fixas da base do Projeto Canoa Para Todos.
 * Texto passado pela equipe do projeto (nov/2026).
 */

export const BASE_LOCAL = {
  name: 'Base do Canoa para Todos',
  address: 'Rua Pescador Altino Garcês, 35 – Praia do Porto Grande',
  mapUrl: 'https://maps.app.goo.gl/yGJoRKrPCFsn2yEbA',
};

/** Local padrão sugerido ao abrir uma remada nova. */
export const DEFAULT_SESSION_LOCATION = 'Base do Canoa para Todos – Praia do Porto Grande';

export const ARRIVAL_MINUTES = 15;

export const IMPORTANT_RULES: { icon: string; text: string }[] = [
  { icon: '⚠️', text: 'Identifique seu contato' },
  { icon: '💢', text: `Chegue ${ARRIVAL_MINUTES} min antes para montar as canoas` },
  { icon: '🍶', text: 'Leve sua garrafinha de água' },
  { icon: '❌', text: 'Não retire seu nome de última hora' },
  { icon: '🚸', text: 'Reservas não devem ir à base' },
  { icon: '🦺', text: 'Uso obrigatório do colete/flutuador!' },
  {
    icon: '🚣🏼',
    text: 'Ao término da remada: ajudar a subir as canoas; coletes e remos lavados e guardados na base',
  },
];
